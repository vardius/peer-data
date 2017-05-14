import Socket = SocketIOClient.Socket;
import * as io from 'socket.io-client';
import { Signaling } from './signaling';
import { ConnectionEvent } from './../connection/event';
import { EventDispatcher } from './../dispatcher/dispatcher';
import { DataEventType } from './../channel/event-type';

export class SocketChannel implements Signaling {
  private socket: Socket;

  constructor(opts?: SocketIOClient.ConnectOpts) {
    this.socket = io.connect(opts);

    this.subscribeEvents();
  }

  onSend(event: ConnectionEvent) {
    this.socket.emit('message', event);
  }

  private subscribeEvents() {
    this.socket.on('message', this.onMessage.bind(this));
    this.socket.on('ipaddr', this.onIp.bind(this));
    this.socket.on('log', this.onLog.bind(this));
    EventDispatcher.register('send', this.onSend.bind(this));
  }

  private onIp(ipaddr: string) {
    EventDispatcher.dispatch(DataEventType.LOG, 'Server IP address is: ' + ipaddr);
  }

  private onLog(...args: any[]) {
    EventDispatcher.dispatch(DataEventType.LOG, args);
  }

  private onMessage(event: ConnectionEvent) {
    EventDispatcher.dispatch(event.type, event);
  }
}
