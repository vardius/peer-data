import { SignalingEvent } from './SignalingEvent';

export interface Signaling {
  onSend(message: SignalingEvent): void;
}
