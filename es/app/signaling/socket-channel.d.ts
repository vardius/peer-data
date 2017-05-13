/// <reference types="socket.io-client" />
import { Signaling } from './signaling';
import { Event } from './../connection/event';
export declare class SocketChannel implements Signaling {
    private socket;
    constructor(opts?: SocketIOClient.ConnectOpts);
    private subscribeEvents();
    onSend(event: Event): void;
    private onIp(ipaddr);
    private onLog(...args);
    private onMessage(event);
}
