/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Event } from './signaling/event';
import { Signaling } from './signaling/signaling';
import { Connection } from './connection/connection';
export declare class Bridge {
    private _connection;
    constructor(connection: Connection);
    onConnect(event: Event, signaling: Signaling): void;
    onCandidate(event: Event): void;
    onOffer(event: Event, signaling: Signaling): void;
    onAnswer(event: Event): void;
    onDisconnect(event: Event): void;
    connection: Connection;
    private dispatchError(event);
}
