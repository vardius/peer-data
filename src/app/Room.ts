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

    EventDispatcher.getInstance().dispatch('send', {
      type: SignalingEventType.CONNECT,
      caller: null,
      callee: null,
      room: { id: this.id },
      payload: null,
    } as SignalingEvent);
  }

  getId = (): string => this.id;

  getStream = (): MediaStream => this.stream;

  on = (event: string, callback: EventHandler): Room => {
    this.dispatcher.register(event, callback);

    return this;
  }

  send = (payload: any): Room => {
    this.participants.forEach((participant: Participant) => participant.send(payload));

    return this;
  }

  disconnect = (): Room => {
    EventDispatcher.getInstance().dispatch('send', {
      type: SignalingEventType.DISCONNECT,
      caller: null,
      callee: null,
      room: { id: this.id },
      payload: null,
    } as SignalingEvent);
    const keys = Array.from(this.participants.keys());

    for (const key of keys) {
      this.participants.get(key).close();
      this.participants.delete(key);
    }

    return this;
  }

  onSignalingEvent = (event: SignalingEvent): Room => {
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
          this.participants.get(event.caller.id).onSignalingEvent(event);
        }
        break;
    }

    return this;
  }

  private onOffer = (event: SignalingEvent) => {
    const desc = new RTCSessionDescription(event.payload);
    if (this.participants.has(event.caller.id)) {
      this.participants.get(event.caller.id).renegotiate(desc);
    } else {
      const participant = new Participant(event.caller.id, this);
      this.participants.set(participant.getId(), participant);
      participant.init(desc)
        .then(p => this.dispatcher.dispatch('participant', p))
        .catch((evnt: DOMException) => this.dispatcher.dispatch('error', evnt));
    }
  }

  private onConnect = (event: SignalingEvent) => {
    if (this.participants.has(event.caller.id)) {
      this.participants.get(event.caller.id).renegotiate();
    } else {
      const participant = new Participant(event.caller.id, this);
      this.participants.set(participant.getId(), participant);
      participant.init()
        .then(p => this.dispatcher.dispatch('participant', p))
        .catch((evnt: DOMException) => this.dispatcher.dispatch('error', evnt));
    }
  }

  private onDisconnect = (event: SignalingEvent) => {
    if (this.participants.has(event.caller.id)) {
      this.participants.get(event.caller.id).close();
      this.participants.delete(event.caller.id);
    }
  }
}
