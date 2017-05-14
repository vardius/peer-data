import Socket = SocketIOClient.Socket;
import * as io from 'socket.io-client';
import { Signaling } from './signaling';
import { Event } from './../connection/event';
import { EventDispatcher } from './../dispatcher/dispatcher';
import { EventType } from './../channel/event-type';

export class SocketChannel implements Signaling {
  private socket: Socket;

  constructor(opts?: SocketIOClient.ConnectOpts) {
    this.socket = io.connect(opts);

    this.subscribeEvents();
  }

  onSend(event: Event) {
    this.socket.emit('message', event);
  }

  private subscribeEvents() {
    this.socket.on('message', this.onMessage.bind(this));
    this.socket.on('ipaddr', this.onIp.bind(this));
    this.socket.on('log', this.onLog.bind(this));
    EventDispatcher.register('send', this.onSend.bind(this));
  }

  private onIp(ipaddr: string) {
    EventDispatcher.dispatch(EventType.LOG, 'Server IP address is: ' + ipaddr);
  }

  private onLog(...args: any[]) {
    EventDispatcher.dispatch(EventType.LOG, args);
  }

  private onMessage(event: Event) {
    EventDispatcher.dispatch(event.type, event);
  }
}
