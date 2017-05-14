import { EventType } from './channel/event-type';
import { EventDispatcher } from './dispatcher/dispatcher';
import { Event } from './connection/event';
import { EventType as SignalingEventType } from './connection/event-type';
import { Connection } from './connection/connection';
import { Bridge } from './bridge';
import { EventHandler } from './dispatcher/handler';

export class App {
  private bridge: Bridge;

  constructor(servers: RTCConfiguration = {}, dataConstraints: RTCDataChannelInit = null) {
    const connection = new Connection(servers, dataConstraints);
    this.bridge = new Bridge(connection);
  }

  on(event: EventType, callback: EventHandler) {
    EventDispatcher.register(event, callback);
  }

  send(data: any, id?: string) {
    if (id) {
      const channel = this.bridge.connection.channels[id];
      if (channel) {
        channel.send(data);
      }
    } else {
      Object
        .entries(this.bridge.connection.channels)
        .forEach(([key, value]) => value.send(data));
    }
  }

  connect(roomId?: string) {
    const event: Event = {
      type: SignalingEventType.CONNECT,
      caller: null,
      callee: null,
      room: { id: roomId },
      data: null,
    };
    EventDispatcher.dispatch('send', event);
  }

  disconnect(roomId?: string) {
    Object
      .entries(this.bridge.connection.channels)
      .forEach(([key, value]) => value.close());

    Object
      .entries(this.bridge.connection.peers)
      .forEach(([key, value]) => value.close());

    const event: Event = {
      type: SignalingEventType.DISCONNECT,
      caller: null,
      callee: null,
      room: { id: roomId },
      data: null,
    };
    EventDispatcher.dispatch('send', event);
  }
}
