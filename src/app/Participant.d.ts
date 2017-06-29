import { EventHandler } from './EventHandler';
import { SignalingEvent } from './SignalingEvent';
import { Room } from './Room';
export declare class Participant {
    private id;
    private room;
    private peer;
    private channel;
    private dispatcher;
    private remoteDesc;
    constructor(id: string, room: Room, remoteDesc?: RTCSessionDescription);
    getId(): string;
    init(): Promise<this>;
    on(event: string, callback: EventHandler): void;
    send(payload: any): void;
    close(): void;
    handleEvent(event: SignalingEvent): void;
    private onAnswer(event);
    private onCandidate(event);
    private newDataChannel(dataConstraints);
    private onIceCandidate(iceEvent);
    private onConnectionStateChange();
    private onIceConnectionStateChange();
    private onDataChannel(event);
    private onMessage(event);
    private dispatchRemoteStream(event);
}
