import { Signaling, SignalingEvent } from './Signaling';
import { EventDispatcher } from './EventDispatcher';

// tslint:disable-next-line: no-var-requires no-require-imports
const io = require('socket.io-client');

export class SocketChannel implements Signaling {
  private socket: SocketIOClient.Socket;

  constructor(opts?: SocketIOClient.ConnectOpts) {
    this.socket = io(opts);

    EventDispatcher.getInstance().register('send', this.onSend);

    this.subscribeEvents();
  }

  onSend = (event: SignalingEvent) => {
    this.socket.emit('message', event);
  }

  private subscribeEvents() {
    this.socket.on('message', this.onMessage);
    this.socket.on('ipaddr', this.onIp);
    this.socket.on('log', this.onLog);
  }

  private onIp = (ipaddr: string) => {
    EventDispatcher.getInstance().dispatch('log', 'Server IP address is: ' + ipaddr);
  }

  private onLog = (...args: any[]) => {
    EventDispatcher.getInstance().dispatch('log', args);
  }

  private onMessage = (event: SignalingEvent) => {
    EventDispatcher.getInstance().dispatch(event.type, event);
  }
}
