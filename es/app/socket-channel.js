import * as io from 'socket.io-client';
import { SignalingEventType } from './signaling/event-type';
import { EventDispatcher } from './handler/dispatcher';
import { EventType } from './handler/event-type';
export class SocketChannel {
    constructor(bridge, opts) {
        this.socket = io.connect(opts);
        this.bridge = bridge;
        this.subscribeEvents();
    }
    send(event) {
        this.socket.emit('message', event);
    }
    subscribeEvents() {
        this.socket.on('message', this.onMessage);
        this.socket.on('ipaddr', this.onIp);
        this.socket.on('log', this.onLog);
    }
    onIp(ipaddr) {
        EventDispatcher.dispatch(EventType.LOG, 'Server IP address is: ' + ipaddr);
    }
    onLog(...args) {
        EventDispatcher.dispatch(EventType.LOG, args);
    }
    onMessage(event) {
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
//# sourceMappingURL=socket-channel.js.map