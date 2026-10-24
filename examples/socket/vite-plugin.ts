import type { Plugin } from 'vite';
import { attachSignaling } from './server.js';

/**
 * Runs the signaling server on Vite's own server, in `vite` and `vite preview`, so pages signal through `io()`
 * on the origin they were served from. Vite's server only runs while you develop: in production, run
 * attachSignaling on a server of your own.
 */
export function signaling(): Plugin {
  return {
    name: 'peer-data-signaling',
    configureServer(server) {
      // Middleware mode has no server of its own.
      if (server.httpServer) attachSignaling(server.httpServer);
    },
    configurePreviewServer(server) {
      attachSignaling(server.httpServer);
    },
  };
}
