import { EventType } from './channel/event-type';
import { EventHandler } from './dispatcher/handler';
export declare class App {
    private bridge;
    constructor(servers?: RTCConfiguration, dataConstraints?: RTCDataChannelInit);
    on(event: EventType, callback: EventHandler): void;
    send(data: any, id?: string): void;
    connect(roomId?: string): void;
    disconnect(roomId?: string): void;
}
