import { mkdtemp, rm } from 'node:fs/promises';
import { request, type Server as NodeServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import { io as connect, type Socket } from 'socket.io-client';
import { createServer, preview, type HttpServer, type InlineConfig, type Plugin } from 'vite';
import type { SignalingEvent } from 'peer-data';
import { signaling } from './vite-plugin.js';

const cleanups: (() => Promise<void>)[] = [];

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

const connectEvent = (room: string, id: string): SignalingEvent => ({
  type: 'CONNECT',
  room: { id: room },
  caller: { id },
  callee: null,
  payload: null,
});

async function socketTo(url: string): Promise<Socket> {
  const socket = connect(url, { transports: ['websocket'] });
  cleanups.push(() => Promise.resolve(void socket.close()));
  await new Promise<void>((resolve) => socket.on('connect', resolve));
  return socket;
}

/** Joins a room from two sockets, and resolves with what the first heard of the second. */
async function meet(url: string): Promise<SignalingEvent> {
  const first = await socketTo(url);
  const second = await socketTo(url);
  const heard: SignalingEvent[] = [];
  first.on('message', (event: SignalingEvent) => heard.push(event));
  first.emit('message', connectEvent('vite', 'first'));

  // Each try joins with a new id, until one arrives after the first socket's own CONNECT was routed.
  let tries = 0;
  await vi.waitFor(() => {
    second.emit('message', connectEvent('vite', `second-${String(tries++)}`));
    expect(heard).not.toEqual([]);
  });
  return heard[0] as SignalingEvent;
}

const urlOf = (address: AddressInfo | string | null | undefined) =>
  `http://127.0.0.1:${String((address as AddressInfo).port)}`;

test('pages signal through the dev server', async () => {
  const server = await createServer({
    configFile: false,
    logLevel: 'silent',
    plugins: [signaling()],
    server: { host: '127.0.0.1', port: 0 },
  });
  cleanups.push(() => server.close());
  await server.listen();

  const event = await meet(urlOf(server.httpServer?.address()));

  expect(event).toMatchObject({ type: 'CONNECT', room: { id: 'vite' } });
});

test('pages signal through the preview server', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'peer-data-preview-'));
  cleanups.push(() => rm(outDir, { recursive: true }));
  const server = await preview({
    configFile: false,
    logLevel: 'silent',
    plugins: [signaling()],
    build: { outDir },
    preview: { host: '127.0.0.1', port: 0 },
  });
  cleanups.push(() => server.close());

  const event = await meet(urlOf(server.httpServer.address()));

  expect(event).toMatchObject({ type: 'CONNECT', room: { id: 'vite' } });
});

/** Another WebSocket on the same server, as a proxy to a slow backend has: it answers after more than a second. */
const slowSocket: Plugin = {
  name: 'slow-socket',
  configureServer(server) {
    if (server.httpServer) answerLate(server.httpServer);
  },
  configurePreviewServer(server) {
    answerLate(server.httpServer);
  },
};

function answerLate(httpServer: HttpServer): void {
  (httpServer as NodeServer).on('upgrade', (incoming, socket) => {
    if (incoming.url !== '/slow') return;
    setTimeout(() => {
      socket.end('HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n');
    }, 1200);
  });
}

/** Whether a WebSocket upgrade to /slow gets its answer. */
function upgrades(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const asking = request(`${url}/slow`, { headers: { Connection: 'Upgrade', Upgrade: 'websocket' } });
    asking.on('upgrade', (_response, socket) => {
      socket.destroy();
      resolve(true);
    });
    asking.on('error', () => {
      resolve(false);
    });
    asking.end();
  });
}

test("the signaling server leaves the dev and preview servers' other WebSockets open, however slow", async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'peer-data-preview-'));
  cleanups.push(() => rm(outDir, { recursive: true }));
  const config: InlineConfig = { configFile: false, logLevel: 'silent', plugins: [signaling(), slowSocket] };
  const dev = await createServer({ ...config, server: { host: '127.0.0.1', port: 0 } });
  cleanups.push(() => dev.close());
  await dev.listen();
  const previewed = await preview({ ...config, build: { outDir }, preview: { host: '127.0.0.1', port: 0 } });
  cleanups.push(() => previewed.close());

  expect(
    await Promise.all([upgrades(urlOf(dev.httpServer?.address())), upgrades(urlOf(previewed.httpServer.address()))]),
  ).toEqual([true, true]);
});
