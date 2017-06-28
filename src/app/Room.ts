import { EventDispatcher } from './EventDispatcher';
import { SignalingEventType } from './SignalingEventType';
import { EventHandler } from './EventHandler';
import { Participant } from './Participant';
import { SignalingEvent } from './SignalingEvent';

export class Room {
  private id: string;
  private participants: Map<string, Participant> = new Map();
  private dispatcher: EventDispatcher = new EventDispatcher();
  private stream: MediaStream = null;

  constructor(id: string, stream: MediaStream = null) {
    this.id = id;
    this.stream = stream;

    this.onConnect = this.onConnect.bind(this);
    this.onOffer = this.onOffer.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);

    EventDispatcher.getInstance().dispatch('send', {
      type: SignalingEventType.CONNECT,
      caller: null,
      callee: null,
      room: { id: this.id },
      payload: null,
    } as SignalingEvent);
  }

  getId(): string {
    return this.id;
  }

  getStream(): MediaStream {
    return this.stream;
  }

  on(event: string, callback: EventHandler) {
    this.dispatcher.register(event, callback);
  }

  send(payload: any) {
    // todo: refactor when typescript supports map
    const keys = Array.from(this.participants.keys());
    for (const key of keys) {
      this.participants.get(key).send(payload);
    }
  }

  disconnect() {
    EventDispatcher.getInstance().dispatch('send', {
      type: SignalingEventType.DISCONNECT,
      caller: null,
      callee: null,
      room: { id: this.id },
      payload: null,
    } as SignalingEvent);

    // todo: refactor when typescript supports map
    const keys = Array.from(this.participants.keys());
    for (const key of keys) {
      this.participants.get(key).close();
      this.participants.delete(key);
    }
  }

  handleEvent(event: SignalingEvent) {
    if (this.id !== event.room.id) {
      return;
    }

    switch (event.type) {
      case SignalingEventType.CONNECT:
        this.onConnect(event);
        break;
      case SignalingEventType.OFFER:
        this.onOffer(event);
        break;
      case SignalingEventType.DISCONNECT:
        this.onDisconnect(event);
        break;
      case SignalingEventType.ANSWER:
      case SignalingEventType.CANDIDATE:
        if (this.participants.has(event.caller.id)) {
          this.participants.get(event.caller.id).handleEvent(event);
        }
        break;
    }
  }

  private onOffer(event: SignalingEvent) {
    const desc = new RTCSessionDescription(event.payload);
    const participant = new Participant(event.caller.id, this, desc);
    this.participants.set(participant.getId(), participant);
    this.dispatcher.dispatch('participant', participant.init());
  }

  private onConnect(event: SignalingEvent) {
    const participant = new Participant(event.caller.id, this);
    this.participants.set(participant.getId(), participant);
    this.dispatcher.dispatch('participant', participant.init());
  }

  private onDisconnect(event: SignalingEvent) {
    if (this.id === event.room.id && this.participants.has(event.caller.id)) {
      this.participants.get(event.caller.id).close();
      this.participants.delete(event.caller.id);
    }
  }
}
