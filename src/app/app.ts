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
import {Logger} from './logger/logger';
import {Signaling} from './signaling/signaling';
import {Connection} from './connection/connection';
import {ConsoleLogger} from './console-logger';
import {LogLevel} from './logger/log-level';
import {Bridge} from './bridge';

export class App {
  private bridge: Bridge;
  private _signalling: Signaling;

  constructor(servers: RTCConfiguration = {}, dataConstraints: RTCDataChannelInit = null) {
    const connection = new Connection(servers, dataConstraints);
    const logger = new ConsoleLogger(LogLevel.ERROR);
    this.bridge = new Bridge(connection, logger);
  }

  on(event: EventType, callback: EventHandler) {
    EventDispatcher.register(event, callback);
  }

  send(data: any, ids?: string []) {
    Object.entries(this.bridge.connection.channels)
      .forEach(([key, value]) => {
        if (!ids || (ids.length > 1 && ids.indexOf(key) !== -1)) {
          value.send(data);
        }
      });
  }

  connect() {
    let event: SignalingEvent = {
      type: SignalingEventType.CONNECT,
      caller: null,
      callee: null,
      data: null
    };
    this._signalling.send(event);
  }

  disconnect(ids?: string[]) {
    Object.entries(this.bridge.connection.channels)
      .forEach(([key, value]) => {
        if (!ids || (ids.length > 1 && ids.indexOf(key) !== -1)) {
          value.close();
          delete this.bridge.connection.channels[key];
        }
      });
    Object.entries(this.bridge.connection.peers)
      .forEach(([key, value]) => {
        if (!ids || (ids.length > 1 && ids.indexOf(key) !== -1)) {
          value.close();
          delete this.bridge.connection.peers[key];
          let event: SignalingEvent = {
            type: SignalingEventType.DISCONNECT,
            caller: null,
            callee: null,
            data: null
          };
          this._signalling.send(event);
        }
      });
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

  get logger(): Logger {
    return this.bridge.logger;
  }

  set logger(value: Logger) {
    this.bridge.logger = value;
  }

  get signalling(): Signaling {
    return this._signalling;
  }

  set signalling(value: Signaling) {
    this._signalling = value;
  }
}
