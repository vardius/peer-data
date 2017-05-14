import { ConnectionEvent } from './../connection/event';

export interface Signaling {
  onSend(message: ConnectionEvent): void;
}
