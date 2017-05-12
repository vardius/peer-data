/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Socket = SocketIOClient.Socket;
import * as io from 'socket.io-client';
import { Bridge } from './bridge';
import { Signaling } from './signaling/signaling';
import { SignalingEvent } from './signaling/event';
import { SignalingEventType } from './signaling/event-type';
import { EventDispatcher } from './data-channel/dispatcher';
import { EventType } from './data-channel/event-type';

export class SocketChannel implements Signaling {
  private socket: Socket;
  private bridge: Bridge;

  constructor(bridge: Bridge, opts?: SocketIOClient.ConnectOpts) {
    this.socket = io.connect(opts);
    this.bridge = bridge;

    this.subscribeEvents();
  }

  send(event: SignalingEvent) {
    this.socket.emit('message', event);
  }

  private subscribeEvents() {
    this.socket.on('message', this.onMessage);
    this.socket.on('ipaddr', this.onIp);
    this.socket.on('log', this.onLog);
  }

  private onIp(ipaddr: string) {
    EventDispatcher.dispatch(EventType.LOG, 'Server IP address is: ' + ipaddr);
  }

  private onLog(...args: any[]) {
    EventDispatcher.dispatch(EventType.LOG, args);
  }

  private onMessage(event: SignalingEvent) {
    switch (event.type) {
      case SignalingEventType.OFFER:
        this.bridge.onOffer(event, this);
        break;
      case SignalingEventType.ANSWER:
        this.bridge.onAnswer(event);
        break;
      case SignalingEventType.CANDIDATE:
        this.bridge.onCandidate(event);
        break;
      case SignalingEventType.CONNECT:
        this.bridge.onConnect(event, this);
        break;
      case SignalingEventType.DISCONNECT:
        this.bridge.onDisconnect(event);
        break;
    }
  }
}
