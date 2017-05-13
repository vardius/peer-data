/// <reference types="socket.io-client" />
import { Bridge } from './bridge';
import { Signaling } from './signaling/signaling';
import { SignalingEvent } from './signaling/event';
export declare class SocketChannel implements Signaling {
    private socket;
    private bridge;
    constructor(bridge: Bridge, opts?: SocketIOClient.ConnectOpts);
    send(event: SignalingEvent): void;
    private subscribeEvents();
    private onIp(ipaddr);
    private onLog(...args);
    private onMessage(event);
}
