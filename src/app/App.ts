import { EventDispatcher } from './EventDispatcher';
import { SignalingEvent, SignalingEventType } from './Signaling';
import { Configuration } from './Configuration';
import { Room } from './Room';

export class App {
  private rooms: Map<string, Room> = new Map();

  constructor(servers: RTCConfiguration = {}, dataConstraints?: RTCDataChannelInit) {
    Configuration.getInstance().setServers(servers);

    if (dataConstraints) { Configuration.getInstance().setDataConstraints(dataConstraints); }

    EventDispatcher.getInstance().register(SignalingEventType.CONNECT, this.onEvent);
    EventDispatcher.getInstance().register(SignalingEventType.OFFER, this.onEvent);
    EventDispatcher.getInstance().register(SignalingEventType.DISCONNECT, this.onEvent);
    EventDispatcher.getInstance().register(SignalingEventType.ANSWER, this.onEvent);
    EventDispatcher.getInstance().register(SignalingEventType.CANDIDATE, this.onEvent);
    EventDispatcher.getInstance().register('send', this.onDisconnected);
  }

  connect = (id: string, stream?: MediaStream): Room => {
    if (this.rooms.has(id)) {
      return this.rooms.get(id) as Room;
    }

    const room = new Room(id, stream);
    this.rooms.set(id, room);

    return room;
  }

  private onEvent = (event: SignalingEvent): App => {
    if (this.rooms.has(event.room.id)) {
      (this.rooms.get(event.room.id) as Room).onSignalingEvent(event);
    }

    return this;
  }

  private onDisconnected = (event: SignalingEvent) => {
    if (event.type === SignalingEventType.DISCONNECT) {
      this.rooms.delete(event.room.id);
    }
  }
}
