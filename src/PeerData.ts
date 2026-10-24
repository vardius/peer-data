import { Room } from './Room.js';
import { isSignalingEvent, type Signaling } from './signaling.js';

export interface PeerDataOptions {
  /** Passed to every RTCPeerConnection: ICE servers and the rest. */
  configuration?: RTCConfiguration;
  /**
   * Options for the data channel to each participant. Every peer in a room must use the same ones: both sides
   * of a connection create the channel.
   */
  channel?: Omit<RTCDataChannelInit, 'id' | 'negotiated'>;
  /**
   * How long a participant's data channel has to open, in ms, before the participant is closed: for a peer
   * that never answers. Defaults to 30000.
   */
  connectTimeout?: number;
}

/** This peer: joins rooms over signaling, and connects to the other peers in them. */
export class PeerData {
  readonly #signaling: Signaling;
  readonly #configuration: RTCConfiguration;
  readonly #channel: RTCDataChannelInit;
  readonly #connectTimeout: number;
  readonly #rooms = new Map<string, Room>();
  readonly #unsubscribe: () => void;
  #closed = false;

  constructor(signaling: Signaling, options: PeerDataOptions = {}) {
    this.#signaling = signaling;
    this.#configuration = options.configuration ?? {};
    this.#channel = options.channel ?? {};
    this.#connectTimeout = options.connectTimeout ?? 30_000;
    this.#unsubscribe = signaling.subscribe(this.#receive);
  }

  /**
   * Joins the room with the given id, or returns it if this peer is already in it. Every track of stream, if
   * given, is shared with each participant.
   */
  connect(roomId: string, stream?: MediaStream): Room {
    if (this.#closed) throw new Error('peer-data: connect after close');
    if (roomId === '') throw new TypeError('peer-data: the room id is empty');
    const existing = this.#rooms.get(roomId);
    if (existing) return existing;

    const room = new Room(roomId, {
      configuration: this.#configuration,
      channel: this.#channel,
      connectTimeout: this.#connectTimeout,
      stream,
      send: (event) => {
        this.#signaling.send(event);
      },
      onLeave: (left) => {
        if (this.#rooms.get(left.id) === left) this.#rooms.delete(left.id);
      },
    });
    // Registered before it announces itself, so a reply that arrives at once finds it.
    this.#rooms.set(roomId, room);
    try {
      room.join();
    } catch (error) {
      // Not joined: a later connect tries again.
      this.#rooms.delete(roomId);
      throw error;
    }
    return room;
  }

  /**
   * Leaves every room and stops listening to signaling. Every room is left even when signaling throws; the first
   * error is thrown after.
   */
  close(): void {
    if (this.#closed) return;
    this.#closed = true;
    let failure: { error: unknown } | undefined;
    for (const room of [...this.#rooms.values()]) {
      try {
        room.disconnect();
      } catch (error) {
        failure ??= { error };
      }
    }
    this.#unsubscribe();
    if (failure) throw failure.error;
  }

  readonly #receive = (message: unknown): void => {
    if (!isSignalingEvent(message)) return;
    this.#rooms.get(message.room.id)?.receive(message);
  };
}
