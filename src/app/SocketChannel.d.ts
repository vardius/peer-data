/// <reference types="socket.io-client" />
import { Signaling } from './Signaling';
import { SignalingEvent } from './SignalingEvent';
export declare class SocketChannel implements Signaling {
    private socket;
    constructor(opts?: SocketIOClient.ConnectOpts);
    onSend(event: SignalingEvent): void;
    private subscribeEvents();
    private onIp(ipaddr);
    private onLog(...args);
    private onMessage(event);
}
