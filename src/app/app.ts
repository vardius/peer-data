/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {EventType} from './data-channel/event-type';
import {EventDispatcher} from './data-channel/dispatcher';
import {SignalingEvent} from './signaling/event';
import {SignalingEventType} from './signaling/event-type';
import {Signaling} from './signaling/signaling';
import {Connection} from './connection/connection';
import {Bridge} from './bridge';

export class App {
  private bridge: Bridge;
  private _signaling: Signaling = null;

  constructor(servers: RTCConfiguration = {}, dataConstraints: RTCDataChannelInit = null) {
    const connection = new Connection(servers, dataConstraints);
    this.bridge = new Bridge(connection);
  }

  on(event: EventType, callback: EventHandler) {
    EventDispatcher.register(event, callback);
  }

  send(data: any) {
    Object.entries(this.bridge.connection.channels)
      .forEach(([key, value]) => value.send(data));
  }

  connect() {
    let event: SignalingEvent = {
      type: SignalingEventType.CONNECT,
      caller: null,
      callee: null,
      data: null
    };
    this._signaling.send(event);
  }

  disconnect() {
    Object.entries(this.bridge.connection.channels).forEach(([key, value]) => value.close());

    Object.entries(this.bridge.connection.peers).forEach(([key, value]) => value.close());

    const event: SignalingEvent = {
      type: SignalingEventType.DISCONNECT,
      caller: null,
      callee: null,
      data: null
    };
    this._signaling.send(event);
  }

  get servers(): RTCConfiguration {
    return this.bridge.connection.servers;
  }

  set servers(value: RTCConfiguration) {
    this.bridge.connection.servers = value;
  }

  get dataConstraints(): RTCDataChannelInit {
    return this.bridge.connection.dataConstraints;
  }

  set dataConstraints(value: RTCDataChannelInit) {
    this.bridge.connection.dataConstraints = value;
  }

  get signaling(): Signaling {
    return this._signaling;
  }

  set signaling(value: Signaling) {
    this._signaling = value;
  }
}
