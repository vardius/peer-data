import { Emitter, report, toError, type Listener } from './Emitter.js';
import type { DirectedSignalingEvent, Identifiable, SignalingEvent } from './signaling.js';

/**
 * What send accepts. A Blob isn't one: browsers read a Blob before sending it, so it could overtake data sent
 * before it or fall behind data sent after. Send await blob.arrayBuffer() instead.
 */
export type Payload = string | ArrayBuffer | ArrayBufferView<ArrayBuffer>;

export interface ParticipantEvents {
  /** The data channel opened: sends now go straight out instead of waiting. */
  connected: undefined;
  /** A message arrived: a string, or an ArrayBuffer for binary data. */
  message: string | ArrayBuffer;
  /** The participant shared a media track. */
  track: RTCTrackEvent;
  /** The participant is gone, and the connection to it closed. Fires once. */
  disconnected: undefined;
  /** Negotiating the connection failed. */
  error: Error;
}

/** @internal */
export interface ParticipantInit {
  room: Identifiable;
  /** This peer's id in the room. */
  self: Identifiable;
  configuration: RTCConfiguration;
  channel: RTCDataChannelInit;
  /** How long the data channel has to open before the participant is closed, in ms. */
  connectTimeout: number;
  stream: MediaStream | undefined;
  send: (event: SignalingEvent) => void;
  onClose: (participant: Participant) => void;
}

/**
 * Another peer in a room, and the connection to it: one RTCPeerConnection with one data channel.
 *
 * Negotiation follows the perfect negotiation pattern from the WebRTC specification, so either side can add
 * media at any time and offers that cross are resolved without help.
 */
export class Participant {
  /** The participant's id, as the signaling server knows it. */
  readonly id: string;
  /** The connection to the participant, for what Participant doesn't cover, such as getStats. */
  readonly connection: RTCPeerConnection;
  /**
   * The data channel to the participant, for its bufferedAmount and bufferedamountlow event when sending a lot.
   * Send through send, which waits for the channel to open.
   */
  readonly channel: RTCDataChannel;

  readonly #transmit: (data: Payload) => void;
  readonly #events = new Emitter<ParticipantEvents>();
  readonly #route: { room: Identifiable; caller: Identifiable; callee: Identifiable };
  readonly #send: (event: SignalingEvent) => void;
  readonly #onClose: (participant: Participant) => void;
  /** Messages sent before the channel opened, in order. */
  #pending: Payload[] = [];
  /** Closes the participant if its channel doesn't open in time. */
  readonly #connectTimer: ReturnType<typeof setTimeout>;
  #closed = false;

  // Perfect negotiation state.
  #makingOffer = false;
  #ignoreOffer = false;
  #settingRemoteAnswer = false;
  /**
   * This peer's id as the participant addresses it. It decides which side yields when offers cross, so both
   * sides must compare the same pair of ids: a server that replaces caller ids with its own makes it differ
   * from the id this peer sends, and the participant's events tell us which one it uses.
   */
  #self: string;

  /** @internal */
  constructor(id: string, init: ParticipantInit) {
    this.id = id;
    this.#self = init.self.id;
    this.#route = { room: init.room, caller: init.self, callee: { id } };
    this.#send = init.send;
    this.#onClose = init.onClose;

    this.connection = new RTCPeerConnection(init.configuration);
    try {
      // Both sides create the same channel, so it exists from the start and renegotiation never replaces it.
      this.channel = this.connection.createDataChannel('peer-data', { ...init.channel, negotiated: true, id: 0 });
      this.channel.binaryType = 'arraybuffer';
      // RTCDataChannel.send has one overload per type, which a union of them doesn't match.
      this.#transmit = this.channel.send.bind(this.channel) as (data: Payload) => void;

      this.channel.onopen = this.#onOpen;
      this.channel.onmessage = this.#onMessage;
      this.channel.onclose = this.#onChannelClose;
      this.connection.onnegotiationneeded = this.#onNegotiationNeeded;
      this.connection.onicecandidate = this.#onIceCandidate;
      this.connection.onconnectionstatechange = this.#onConnectionStateChange;
      this.connection.ontrack = this.#onTrack;

      if (init.stream) this.addStream(init.stream);
    } catch (error) {
      this.connection.close();
      throw error;
    }
    // A peer that never answers, or turned this one away, would otherwise leave it waiting forever.
    this.#connectTimer = setTimeout(() => {
      this.close();
    }, init.connectTimeout);
  }

  on<K extends keyof ParticipantEvents>(type: K, listener: Listener<ParticipantEvents[K]>): this {
    this.#events.on(type, listener);
    return this;
  }

  off<K extends keyof ParticipantEvents>(type: K, listener: Listener<ParticipantEvents[K]>): this {
    this.#events.off(type, listener);
    return this;
  }

  /**
   * Sends data to the participant. Before the data channel opens, data waits and goes out in order once it
   * does. Throws once the participant is disconnecting or disconnected.
   */
  send(data: Payload): this {
    if (data instanceof Blob) throw new TypeError('peer-data: send await blob.arrayBuffer() instead of a Blob');
    const state = this.channel.readyState;
    if (this.#closed || state === 'closing' || state === 'closed') {
      throw new Error(`peer-data: participant ${this.id} is disconnected`);
    }
    if (state === 'open') {
      this.#transmit(data);
    } else {
      // Copied, as the channel copies what it sends: changes to data after this call don't reach the participant.
      this.#pending.push(copy(data));
    }
    return this;
  }

  /** Shares every track of stream with the participant. The connection renegotiates by itself. */
  addStream(stream: MediaStream): this {
    for (const track of stream.getTracks()) this.connection.addTrack(track, stream);
    return this;
  }

  /** Closes the connection to the participant. */
  close(): void {
    if (this.#closed) return;
    this.#closed = true;
    clearTimeout(this.#connectTimer);
    this.#pending = [];
    this.channel.close();
    this.connection.close();
    this.#onClose(this);
    this.#events.emit('disconnected', undefined);
  }

  /** @internal Applies an event the participant sent about this connection. */
  async receive(event: DirectedSignalingEvent): Promise<void> {
    this.#self = event.callee.id;
    try {
      if (event.type === 'CANDIDATE') {
        await this.#addIceCandidate(event.payload);
      } else {
        await this.#setRemoteDescription(event.payload);
      }
    } catch (error) {
      this.#fail(error);
    }
  }

  async #setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    // An offer can arrive while an answer is being applied: the connection is stable by the time it's processed.
    const readyForOffer =
      !this.#makingOffer && (this.connection.signalingState === 'stable' || this.#settingRemoteAnswer);
    const offerCollision = description.type === 'offer' && !readyForOffer;
    this.#ignoreOffer = offerCollision && !this.#polite();
    if (this.#ignoreOffer) return;

    this.#settingRemoteAnswer = description.type === 'answer';
    try {
      // Rolls back an offer of ours that crossed this one.
      await this.connection.setRemoteDescription(description);
    } finally {
      this.#settingRemoteAnswer = false;
    }
    if (description.type !== 'offer') return;

    await this.connection.setLocalDescription();
    this.#signal('ANSWER', this.#localDescription());
  }

  async #addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      await this.connection.addIceCandidate(candidate);
    } catch (error) {
      // Candidates for an offer we ignored can't be added, and don't need to be.
      if (!this.#ignoreOffer) throw error;
    }
  }

  /** The side with the smaller id yields when offers cross. */
  #polite(): boolean {
    return this.#self < this.id;
  }

  #localDescription(): RTCSessionDescriptionInit {
    const description = this.connection.localDescription;
    if (description === null) throw new Error('peer-data: no local description after setLocalDescription');
    return description.toJSON();
  }

  #signal(type: 'OFFER' | 'ANSWER', payload: RTCSessionDescriptionInit): void;
  #signal(type: 'CANDIDATE', payload: RTCIceCandidateInit): void;
  #signal(type: DirectedSignalingEvent['type'], payload: RTCSessionDescriptionInit | RTCIceCandidateInit): void {
    if (this.#closed) return;
    this.#send({ ...this.#route, type, payload } as DirectedSignalingEvent);
  }

  #fail(error: unknown): void {
    if (this.#closed) return;
    const err = toError(error);
    if (!this.#events.emit('error', err)) report(err);
  }

  readonly #onNegotiationNeeded = async (): Promise<void> => {
    try {
      this.#makingOffer = true;
      await this.connection.setLocalDescription();
      this.#signal('OFFER', this.#localDescription());
    } catch (error) {
      this.#fail(error);
    } finally {
      this.#makingOffer = false;
    }
  };

  readonly #onIceCandidate = ({ candidate }: RTCPeerConnectionIceEvent): void => {
    if (!candidate) return;
    try {
      this.#signal('CANDIDATE', candidate.toJSON());
    } catch (error) {
      this.#fail(error);
    }
  };

  readonly #onConnectionStateChange = (): void => {
    // "disconnected" can recover by itself; "failed" can't without an ICE restart.
    if (this.connection.connectionState === 'failed') this.close();
  };

  readonly #onTrack = (event: RTCTrackEvent): void => {
    this.#events.emit('track', event);
  };

  readonly #onOpen = (): void => {
    clearTimeout(this.#connectTimer);
    const pending = this.#pending;
    this.#pending = [];
    try {
      for (const data of pending) this.#transmit(data);
    } catch (error) {
      // The rest can't go out in order after one that didn't, such as when the channel's buffer is full.
      this.#fail(error);
    }
    this.#events.emit('connected', undefined);
  };

  readonly #onMessage = ({ data }: MessageEvent<string | ArrayBuffer>): void => {
    this.#events.emit('message', data);
  };

  // The participant closed its side, or the connection under the channel went away.
  readonly #onChannelClose = (): void => {
    this.close();
  };
}

/** A copy of data that changes to data don't reach. */
function copy(data: Payload): Payload {
  if (typeof data === 'string') return data;
  if (data instanceof ArrayBuffer) return data.slice(0);
  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
}
