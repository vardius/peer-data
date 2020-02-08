import { EventDispatcher } from './EventDispatcher';
import { Identifiable, SignalingEvent, SignalingEventType } from './Signaling';
import { EventHandler } from './EventHandler';
import { Participant } from './Participant';

export class Room {
    private id: string;
    private participants: Map<string, Participant> = new Map();
    private dispatcher: EventDispatcher = new EventDispatcher();
    private stream?: MediaStream;

    constructor(id: string, stream?: MediaStream) {
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

    getStream = (): MediaStream | undefined => this.stream;

    on = (event: string, callback: EventHandler): Room => {
        this.dispatcher.register(event, callback);

        return this;
    };

    send = (payload: any): Room => {
        this.participants.forEach((participant: Participant): Participant => participant.send(payload));

        return this;
    };

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
            (this.participants.get(key) as Participant).close();
            this.participants.delete(key);
        }

        return this;
    };

    onSignalingEvent = (event: SignalingEvent): Room => {
        if (this.id !== event.room.id) {
            return this;
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
            if (this.participants.has((event.caller as Identifiable).id)) {
                (this.participants.get((event.caller as Identifiable).id) as Participant).onSignalingEvent(event);
            }
            break;
        }

        return this;
    };

    private onOffer = (event: SignalingEvent): void => {
        const desc = new RTCSessionDescription(event.payload);
        if (this.participants.has((event.caller as Identifiable).id)) {
            (this.participants.get((event.caller as Identifiable).id) as Participant).renegotiate(desc);
        } else {
            const participant = new Participant((event.caller as Identifiable).id, this);

            this.participants.set(participant.getId(), participant);
            this.dispatcher.dispatch('participant', participant);

            participant
                .init(desc)
                .catch((evnt: DOMException): void => this.dispatcher.dispatch('error', evnt));
        }
    };

    private onConnect = (event: SignalingEvent): void => {
        if (this.participants.has((event.caller as Identifiable).id)) {
            (this.participants.get((event.caller as Identifiable).id) as Participant).renegotiate();
        } else {
            const participant = new Participant((event.caller as Identifiable).id, this);

            this.participants.set(participant.getId(), participant);
            this.dispatcher.dispatch('participant', participant);

            participant
                .init()
                .catch((evnt: DOMException): void => this.dispatcher.dispatch('error', evnt));
        }
    };

    private onDisconnect = (event: SignalingEvent): void => {
        if (this.participants.has((event.caller as Identifiable).id)) {
            (this.participants.get((event.caller as Identifiable).id) as Participant).close();
            this.participants.delete((event.caller as Identifiable).id);
        }
    };
}
