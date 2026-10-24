import type { Signaling, SignalingEvent } from './signaling.js';

/**
 * Signaling without a server, between pages of the same origin in one browser: tabs, windows and iframes.
 * For demos, tests and apps that connect their own tabs. Give each peer its own instance with the same name.
 */
export class BroadcastChannelSignaling implements Signaling {
  readonly #channel: BroadcastChannel;
  /** The ids this peer has joined rooms with: a broadcast reaches every peer, and an offer is for one. */
  readonly #ids = new Set<string>();
  #closed = false;

  constructor(name = 'peer-data') {
    this.#channel = new BroadcastChannel(name);
  }

  send(event: SignalingEvent): void {
    if (this.#closed) return;
    if (event.type === 'CONNECT') this.#ids.add(event.caller.id);
    if (event.type === 'DISCONNECT') this.#ids.delete(event.caller.id);
    this.#channel.postMessage(event);
  }

  subscribe(listener: (message: unknown) => void): () => void {
    const onMessage = ({ data }: MessageEvent<unknown>): void => {
      if (isForSomeoneElse(data, this.#ids)) return;
      listener(data);
    };
    this.#channel.addEventListener('message', onMessage);
    return () => {
      this.#channel.removeEventListener('message', onMessage);
    };
  }

  /** Stops sending and receiving: later sends, such as the DISCONNECT of PeerData.close, go nowhere. */
  close(): void {
    this.#closed = true;
    this.#channel.close();
  }
}

function isForSomeoneElse(message: unknown, ids: ReadonlySet<string>): boolean {
  if (typeof message !== 'object' || message === null || !('callee' in message)) return false;
  const { callee } = message;
  return typeof callee === 'object' && callee !== null && 'id' in callee && !ids.has(String(callee.id));
}
