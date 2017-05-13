import { Event } from './../connection/event';

export interface Signaling {
  onSend(message: Event): void;
}
