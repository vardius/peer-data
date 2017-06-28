import { SignalingEventType } from './SignalingEventType';
import { EventDispatcher } from './EventDispatcher';
import { SignalingEvent } from './SignalingEvent';
import { Configuration } from './Configuration';
import { Room } from './Room';

export class App {
  private rooms: Map<string, Room> = new Map();

  constructor(servers: RTCConfiguration = {}, dataConstraints: RTCDataChannelInit = null) {
    this.onEvent = this.onEvent.bind(this);

    Configuration.getInstance().setServers(servers);
    Configuration.getInstance().setDataConstraints(dataConstraints);

    EventDispatcher.getInstance().register(SignalingEventType.CONNECT, this.onEvent.bind(this));
    EventDispatcher.getInstance().register(SignalingEventType.OFFER, this.onEvent.bind(this));
    EventDispatcher.getInstance().register(SignalingEventType.DISCONNECT, this.onEvent.bind(this));
    EventDispatcher.getInstance().register(SignalingEventType.ANSWER, this.onEvent.bind(this));
    EventDispatcher.getInstance().register(SignalingEventType.CANDIDATE, this.onEvent.bind(this));
    EventDispatcher.getInstance().register('send', this.onDisconnected.bind(this));
  }

  connect(id: string, stream: MediaStream = null): Room {
    if (this.rooms.has(id)) {
      return this.rooms.get(id);
    }

    const room = new Room(id, stream);
    this.rooms.set(id, room);

    return room;
  }

  private onEvent(event: SignalingEvent) {
    if (this.rooms.has(event.room.id)) {
      this.rooms.get(event.room.id).handleEvent(event);
    }
  }

  private onDisconnected(event: SignalingEvent) {
    if (event.type === SignalingEventType.DISCONNECT) {
      this.rooms.delete(event.room.id);
    }
  }
}
