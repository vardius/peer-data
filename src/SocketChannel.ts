import type { Signaling, SignalingEvent } from './signaling.js';

/** The part of a socket.io client socket that SocketChannel uses. Sockets of socket.io-client 2, 3 and 4 fit. */
export interface SignalingSocket {
  emit(event: 'message', signal: SignalingEvent): unknown;
  on(event: 'message', listener: (message: unknown) => void): unknown;
  on(event: 'connect' | 'disconnect', listener: () => void): unknown;
  off(event: 'message', listener: (message: unknown) => void): unknown;
}

/**
 * Signaling over socket.io: events go out and come in as "message" events on the socket you pass.
 *
 * Create the socket with the socket.io-client version that matches your server: version 4 for a socket.io 3
 * or 4 server, version 2 for a socket.io 2 server such as peer-data-server 1.x.
 *
 * When the socket reconnects, SocketChannel announces this peer again in every room it's in: the server
 * forgot it, and the others may have been told it left.
 */
export class SocketChannel implements Signaling {
  readonly #socket: SignalingSocket;
  /** The CONNECT of each room this peer is in, by room and peer id. */
  readonly #joined = new Map<string, SignalingEvent>();
  /** The rooms joined before the socket dropped. socket.io sends what was sent while it was down by itself. */
  #rejoin: string[] = [];

  constructor(socket: SignalingSocket) {
    this.#socket = socket;
    socket.on('disconnect', () => {
      this.#rejoin = [...this.#joined.keys()];
    });
    socket.on('connect', () => {
      for (const key of this.#rejoin) {
        const event = this.#joined.get(key);
        if (event) this.#socket.emit('message', event);
      }
      this.#rejoin = [];
    });
  }

  send(event: SignalingEvent): void {
    const key = `${event.room.id}\n${event.caller.id}`;
    if (event.type === 'CONNECT') this.#joined.set(key, event);
    if (event.type === 'DISCONNECT') this.#joined.delete(key);
    this.#socket.emit('message', event);
  }

  subscribe(listener: (message: unknown) => void): () => void {
    this.#socket.on('message', listener);
    return () => {
      this.#socket.off('message', listener);
    };
  }
}
