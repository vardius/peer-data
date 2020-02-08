import { Signaling, SignalingEvent } from './Signaling';
import { EventDispatcher } from './EventDispatcher';

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const io = require('socket.io-client');

export class SocketChannel implements Signaling {
    private socket: SocketIOClient.Socket;

    constructor(opts?: SocketIOClient.ConnectOpts) {
        this.socket = io(opts);

        EventDispatcher.getInstance().register('send', this.onSend);

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
        EventDispatcher.getInstance().dispatch('log', 'Server IP address is: ' + ipaddr);
    };

    private onLog = (...args: any[]): void => {
        EventDispatcher.getInstance().dispatch('log', args);
    };

    private onMessage = (event: SignalingEvent): void => {
        EventDispatcher.getInstance().dispatch(event.type, event);
    };
}
