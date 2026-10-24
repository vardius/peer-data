import { Emitter, report, toError, type Listener } from './Emitter.js';
import { Participant, type Payload } from './Participant.js';
import type { Identifiable, SignalingEvent } from './signaling.js';

export interface RoomEvents {
  /** Another peer is in the room. Its connection is being set up; sends to it wait until it opens. */
  participant: Participant;
  /** Setting up a participant failed, for example because the RTCConfiguration is invalid. */
  error: Error;
}

/** @internal */
export interface RoomInit {
  configuration: RTCConfiguration;
  channel: RTCDataChannelInit;
  connectTimeout: number;
  stream: MediaStream | undefined;
  send: (event: SignalingEvent) => void;
  onLeave: (room: Room) => void;
}

/** A room joined with PeerData.connect: this peer and a participant for each other peer in it. */
export class Room {
  readonly id: string;

  readonly #self: Identifiable = { id: randomId() };
  readonly #route: Identifiable;
  readonly #participants = new Map<string, Participant>();
  readonly #events = new Emitter<RoomEvents>();
  readonly #init: RoomInit;
  #left = false;

  /** @internal */
  constructor(id: string, init: RoomInit) {
    this.id = id;
    this.#route = { id };
    this.#init = init;
  }

  /** The other peers in the room, by id. */
  get participants(): ReadonlyMap<string, Participant> {
    return this.#participants;
  }

  on<K extends keyof RoomEvents>(type: K, listener: Listener<RoomEvents[K]>): this {
    this.#events.on(type, listener);
    return this;
  }

  off<K extends keyof RoomEvents>(type: K, listener: Listener<RoomEvents[K]>): this {
    this.#events.off(type, listener);
    return this;
  }

  /**
   * Sends data to every participant. One that can't take it, such as one disconnecting, doesn't keep it from
   * the others: the first such error is thrown once every other participant has it.
   */
  send(data: Payload): this {
    let failure: { error: unknown } | undefined;
    for (const participant of this.#participants.values()) {
      try {
        participant.send(data);
      } catch (error) {
        failure ??= { error };
      }
    }
    if (failure) throw failure.error;
    return this;
  }

  /**
   * Leaves the room: tells the others, and closes the connection to each of them. The room is left even when
   * telling the others throws.
   */
  disconnect(): void {
    if (this.#left) return;
    this.#left = true;
    try {
      this.#init.send({ type: 'DISCONNECT', room: this.#route, caller: this.#self, callee: null, payload: null });
    } finally {
      for (const participant of this.#participants.values()) participant.close();
      this.#init.onLeave(this);
    }
  }

  /** @internal Announces this peer to the others in the room. */
  join(): void {
    this.#init.send({ type: 'CONNECT', room: this.#route, caller: this.#self, callee: null, payload: null });
  }

  /** @internal Handles an event sent to the room. */
  receive(event: SignalingEvent): void {
    const { id } = event.caller;
    // A transport that echoes this peer's own CONNECT back to it.
    if (id === this.#self.id) return;
    const participant = this.#participants.get(id);
    switch (event.type) {
      case 'CONNECT':
        // A CONNECT from a participant already here is a new peer with its id, as after a reload with an id the
        // server gives: the connection to the old one is dead.
        participant?.close();
        this.#add(id);
        break;
      case 'DISCONNECT':
        participant?.close();
        break;
      case 'OFFER':
        // A peer that was here first connects to us with an offer.
        void (participant ?? this.#add(id))?.receive(event);
        break;
      case 'ANSWER':
      case 'CANDIDATE':
        void participant?.receive(event);
        break;
    }
  }

  #add(id: string): Participant | undefined {
    let participant: Participant;
    try {
      participant = new Participant(id, {
        room: this.#route,
        self: this.#self,
        configuration: this.#init.configuration,
        channel: this.#init.channel,
        connectTimeout: this.#init.connectTimeout,
        stream: this.#init.stream,
        send: this.#init.send,
        onClose: this.#remove,
      });
    } catch (error) {
      const err = toError(error);
      if (!this.#events.emit('error', err)) report(err);
      return undefined;
    }
    this.#participants.set(id, participant);
    this.#events.emit('participant', participant);
    return participant;
  }

  readonly #remove = (participant: Participant): void => {
    if (this.#participants.get(participant.id) === participant) this.#participants.delete(participant.id);
  };
}

/** A random id for this peer in a room. crypto.randomUUID would need a secure context, and WebRTC doesn't. */
function randomId(): string {
  let id = '';
  for (const byte of crypto.getRandomValues(new Uint8Array(16))) id += byte.toString(16).padStart(2, '0');
  return id;
}
