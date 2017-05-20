import { SignalingEvent } from './event';

export interface Signaling {
  onSend(message: SignalingEvent): void;
}
