import { Signaling } from './Signaling';
import { SignalingEvent } from './SignalingEvent';
import { EventDispatcher } from './EventDispatcher';
import { AppEventType } from './AppEventType';
import * as io from 'socket.io-client';

export class SocketChannel implements Signaling {
  private socket: SocketIOClient.Socket;

  constructor(opts?: SocketIOClient.ConnectOpts) {
    this.socket = io.connect(opts);

    EventDispatcher.register(AppEventType.SEND, this.onSend.bind(this));

    this.subscribeEvents();
  }

  onSend(event: SignalingEvent) {
    this.socket.emit('message', event);
  }

  private subscribeEvents() {
    this.socket.on('message', this.onMessage.bind(this));
    this.socket.on('ipaddr', this.onIp.bind(this));
    this.socket.on('log', this.onLog.bind(this));
  }

  private onIp(ipaddr: string) {
    EventDispatcher.dispatch(AppEventType.LOG, 'Server IP address is: ' + ipaddr);
  }

  private onLog(...args: any[]) {
    EventDispatcher.dispatch(AppEventType.LOG, args);
  }

  private onMessage(event: SignalingEvent) {
    EventDispatcher.dispatch(event.type, event);
  }
}
