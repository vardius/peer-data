import { mkdtemp, rm } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import { io as connect, type Socket } from 'socket.io-client';
import { createServer, preview } from 'vite';
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
