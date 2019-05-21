export interface Identifiable {
  id: string;
}

type SignalingEventBase = { room: Identifiable; caller: Identifiable | null; callee: Identifiable | null; };

export enum SignalingEventType {
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  CANDIDATE = 'CANDIDATE',
  OFFER = 'OFFER',
  ANSWER = 'ANSWER',
  ERROR = 'ERROR',
}

export type SignalingEvent =
  | (SignalingEventBase & { type: SignalingEventType.CONNECT; payload: null; })
  | (SignalingEventBase & { type: SignalingEventType.DISCONNECT; payload: null; })
  | (SignalingEventBase & { type: SignalingEventType.CANDIDATE; payload: RTCIceCandidate; })
  | (SignalingEventBase & { type: SignalingEventType.OFFER; payload: RTCSessionDescriptionInit; })
  | (SignalingEventBase & { type: SignalingEventType.ANSWER; payload: RTCSessionDescriptionInit; })
  | (SignalingEventBase & { type: SignalingEventType.ERROR; payload: any | null; });

export interface Signaling {
  onSend(message: SignalingEvent): void;
}
