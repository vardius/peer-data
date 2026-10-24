import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { TestProject } from 'vitest/node';
import { attachSignaling } from '../examples/socket/server.js';

declare module 'vitest' {
  export interface ProvidedContext {
    signalingUrl: string;
  }
}

/** Starts the example signaling server for the browser tests, on a free port. */
export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  const httpServer = createServer();
  // The tests run on Vitest's own origin.
  const io = attachSignaling(httpServer, { cors: { origin: '*' } });
  await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  const { port } = httpServer.address() as AddressInfo;
  project.provide('signalingUrl', `http://127.0.0.1:${String(port)}`);
  return () => io.close();
}
