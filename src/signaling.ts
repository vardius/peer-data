/** The types of signaling event, as they travel between peers. */
export const SignalingEventType = {
  CONNECT: 'CONNECT',
  DISCONNECT: 'DISCONNECT',
  OFFER: 'OFFER',
  ANSWER: 'ANSWER',
  CANDIDATE: 'CANDIDATE',
} as const;

export type SignalingEventType = (typeof SignalingEventType)[keyof typeof SignalingEventType];

export interface Identifiable {
  id: string;
}

interface Route {
  room: Identifiable;
  /** The peer that sent the event. */
  caller: Identifiable;
}

/**
 * A message between peers, relayed by the signaling server.
 *
 * CONNECT and DISCONNECT go to everyone else in the room; OFFER, ANSWER and CANDIDATE go only to the callee.
 */
export type SignalingEvent =
  | (Route & { type: 'CONNECT'; callee: null; payload: null })
  | (Route & { type: 'DISCONNECT'; callee: null; payload: null })
  | (Route & { type: 'OFFER'; callee: Identifiable; payload: RTCSessionDescriptionInit })
  | (Route & { type: 'ANSWER'; callee: Identifiable; payload: RTCSessionDescriptionInit })
  | (Route & { type: 'CANDIDATE'; callee: Identifiable; payload: RTCIceCandidateInit });

/** An event sent to a single peer: the negotiation of its connection. */
export type DirectedSignalingEvent = Extract<SignalingEvent, { callee: Identifiable }>;

/**
 * Carries signaling events between peers. PeerData sends with send, and receives through the listener it
 * subscribes.
 */
export interface Signaling {
  send(event: SignalingEvent): void;
  /**
   * Passes every message that arrives to listener until the returned function is called. PeerData checks
   * each one and ignores anything that isn't a signaling event.
   */
  subscribe(listener: (message: unknown) => void): () => void;
}

const isIdentifiable = (value: unknown): value is Identifiable =>
  typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string';

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

/** Reports whether message, which came from the network, is a well-formed signaling event. */
export function isSignalingEvent(message: unknown): message is SignalingEvent {
  if (!isObject(message) || !('type' in message) || !('room' in message) || !('caller' in message)) return false;
  if (!isIdentifiable(message.room) || !isIdentifiable(message.caller)) return false;
  switch (message.type) {
    case 'CONNECT':
    case 'DISCONNECT':
      return true;
    case 'OFFER':
    case 'ANSWER':
    case 'CANDIDATE':
      return 'callee' in message && isIdentifiable(message.callee) && 'payload' in message && isObject(message.payload);
    default:
      return false;
  }
}
