/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { EventType } from './handler/event-type';
import { Signaling } from './signaling/signaling';
import { EventHandler } from './handler/handler';
export declare class App {
    private bridge;
    private _signaling;
    constructor(servers?: RTCConfiguration, dataConstraints?: RTCDataChannelInit);
    on(event: EventType, callback: EventHandler): void;
    send(data: any, id?: string): void;
    connect(): void;
    disconnect(): void;
    servers: RTCConfiguration;
    dataConstraints: RTCDataChannelInit;
    signaling: Signaling;
}
