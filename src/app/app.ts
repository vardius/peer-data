import { EventDispatcher } from './dispatcher/dispatcher';
import { SignalingEvent } from './signaling/event';
import { SignalingEventType } from './signaling/event-type';
import { Connection } from './connection/connection';
import { Bridge } from './bridge';
import { EventHandler } from './dispatcher/handler';
import { PeerCollection } from './peer/collection';
import { DataChannelCollection } from './channel/collection';

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
      if (channel && channel.readyState === 'open') {
        channel.send(data);
      }
    } else {
      Object
        .entries(this.bridge.connection.channels)
        .forEach(([key, value]) => {
          if (value.readyState === 'open') {
            value.send(data);
          }
        });
    }
  }

  connect(roomId?: string) {
    const event: SignalingEvent = {
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

    const event: SignalingEvent = {
      type: SignalingEventType.DISCONNECT,
      caller: null,
      callee: null,
      room: { id: roomId },
      data: null,
    };
    EventDispatcher.dispatch('send', event);
  }

  peers(id?: string): PeerCollection | RTCPeerConnection {
    if (id) {
      return this.bridge.connection.peers[id];
    }

    return this.bridge.connection.peers;
  }

  channels(id?: string): DataChannelCollection | RTCDataChannel {
    if (id) {
      return this.bridge.connection.channels[id];
    }

    return this.bridge.connection.channels;
  }
}
