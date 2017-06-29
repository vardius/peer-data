import { EventHandler } from './EventHandler';
import { SignalingEvent } from './SignalingEvent';
export declare class Room {
    private id;
    private participants;
    private dispatcher;
    private stream;
    constructor(id: string, stream?: MediaStream);
    getId(): string;
    getStream(): MediaStream;
    on(event: string, callback: EventHandler): void;
    send(payload: any): void;
    disconnect(): void;
    handleEvent(event: SignalingEvent): void;
    private onOffer(event);
    private onConnect(event);
    private onDisconnect(event);
}
