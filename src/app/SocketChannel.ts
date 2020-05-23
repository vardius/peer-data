import io from 'socket.io-client';
import { Signaling, SignalingEvent } from './Signaling';
import { EventDispatcher } from './EventDispatcher';

export class SocketChannel implements Signaling {
    private socket: SocketIOClient.Socket;
    private dispatcher: EventDispatcher;

    constructor(dispatcher: EventDispatcher , opts?: SocketIOClient.ConnectOpts) {
        this.dispatcher = dispatcher;
        this.socket = io(opts);

        this.dispatcher.register('send', this.onSend);

        this.subscribeEvents();
    }

    onSend = (event: SignalingEvent): void => {
        this.socket.emit('message', event);
    };

    private subscribeEvents = (): void => {
        this.socket.on('message', this.onMessage);
        this.socket.on('ipaddr', this.onIp);
        this.socket.on('log', this.onLog);
    };

    private onIp = (ipaddr: string): void => {
        this.dispatcher.dispatch('log', 'Server IP address is: ' + ipaddr);
    };

    private onLog = (...args: any[]): void => {
        this.dispatcher.dispatch('log', args);
    };

    private onMessage = (event: SignalingEvent): void => {
        this.dispatcher.dispatch(event.type, event);
    };
}
