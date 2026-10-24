import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { signaling } from './socket/vite-plugin.js';

// npm run examples: every example on one dev server, with the socket example's signaling server on the same port.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  resolve: { alias: { 'peer-data': fileURLToPath(new URL('../src/index.ts', import.meta.url)) } },
  plugins: [signaling()],
});
