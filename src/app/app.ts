import { EventDispatcher } from './dispatcher/dispatcher';
import { ConnectionEvent } from './connection/event';
import { ConnectionEventType } from './connection/event-type';
import { Connection } from './connection/connection';
import { Bridge } from './bridge';
import { EventHandler } from './dispatcher/handler';

export class App {
  private bridge: Bridge;

  constructor(servers: RTCConfiguration = {}, dataConstraints: RTCDataChannelInit = null) {
    const connection = new Connection(servers, dataConstraints);
    this.bridge = new Bridge(connection);
  }

  on(event: string, callback: EventHandler) {
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
    const event: ConnectionEvent = {
      type: ConnectionEventType.CONNECT,
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

    const event: ConnectionEvent = {
      type: ConnectionEventType.DISCONNECT,
      caller: null,
      callee: null,
      room: { id: roomId },
      data: null,
    };
    EventDispatcher.dispatch('send', event);
  }
}
