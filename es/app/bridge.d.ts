import { Event } from './connection/event';
import { Signaling } from './signaling/signaling';
import { Connection } from './connection/connection';
export declare class Bridge {
    private _connection;
    constructor(connection: Connection);
    connection: Connection;
    onConnect(event: Event): void;
    onDisconnect(event: Event): void;
    onOffer(event: Event, signaling: Signaling): void;
    onAnswer(event: Event): void;
    onCandidate(event: Event): void;
    private dispatchEvent(event);
    private dispatchError(event);
}
