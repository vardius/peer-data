import * as io from 'socket.io-client';
import { EventDispatcher } from './../dispatcher/dispatcher';
import { EventType } from './../channel/event-type';
export class SocketChannel {
    constructor(opts) {
        this.socket = io.connect(opts);
        this.subscribeEvents();
    }
    subscribeEvents() {
        this.socket.on('message', this.onMessage.bind(this));
        this.socket.on('ipaddr', this.onIp.bind(this));
        this.socket.on('log', this.onLog.bind(this));
        EventDispatcher.register('send', this.onSend.bind(this));
    }
    onSend(event) {
        this.socket.emit('message', event);
    }
    onIp(ipaddr) {
        EventDispatcher.dispatch(EventType.LOG, 'Server IP address is: ' + ipaddr);
    }
    onLog(...args) {
        EventDispatcher.dispatch(EventType.LOG, args);
    }
    onMessage(event) {
        EventDispatcher.dispatch(event.type, event);
    }
}
//# sourceMappingURL=socket-channel.js.map