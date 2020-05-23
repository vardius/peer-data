import { EventDispatcher } from './EventDispatcher';
import { SignalingEvent, SignalingEventType } from './Signaling';
import { Configuration } from './Configuration';
import { Room } from './Room';

export class App {
    private dispatcher: EventDispatcher;
    private configuration: Configuration = new Configuration();
    private rooms: Map<string, Room> = new Map();

    constructor(dispatcher: EventDispatcher, servers: RTCConfiguration = {}, dataConstraints?: RTCDataChannelInit) {
        this.dispatcher = dispatcher;

        this.configuration.setServers(servers);

        if (dataConstraints) { this.configuration.setDataConstraints(dataConstraints); }

        this.dispatcher.register(SignalingEventType.CONNECT, this.onEvent);
        this.dispatcher.register(SignalingEventType.OFFER, this.onEvent);
        this.dispatcher.register(SignalingEventType.DISCONNECT, this.onEvent);
        this.dispatcher.register(SignalingEventType.ANSWER, this.onEvent);
        this.dispatcher.register(SignalingEventType.CANDIDATE, this.onEvent);
        this.dispatcher.register('send', this.onDisconnected);
    }

    getEventDispatcher = (): EventDispatcher => this.dispatcher;

    getConfiguration = (): Configuration => this.configuration;

    connect = (id: string, stream?: MediaStream): Room => {
        if (this.rooms.has(id)) {
            return this.rooms.get(id) as Room;
        }

        const room = new Room(id, this.configuration, this.dispatcher, stream);
        this.rooms.set(id, room);

        return room;
    };

    private onEvent = (event: SignalingEvent): App => {
        if (this.rooms.has(event.room.id)) {
            (this.rooms.get(event.room.id) as Room).onSignalingEvent(event);
        }

        return this;
    };

    private onDisconnected = (event: SignalingEvent): void => {
        if (event.type === SignalingEventType.DISCONNECT) {
            this.rooms.delete(event.room.id);
        }
    };
}
