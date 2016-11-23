/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import "webrtc-adapter";
import {EventType, IEventHandler, EventDispatcher} from "./event";
import {IPeerCollection} from "./peer";
import {IChannelCollection} from "./channel";
import {IMessage} from "./bridge";
import {Config} from "./config";

export interface IApp {
    on(event: EventType, callback: IEventHandler): void;
    connect(): void;
    disconnect(): void;
    peers(): IPeerCollection
    channels(): IChannelCollection
}

export const CONFIG = new Config();

export default class App implements IApp {

    constructor(conf: Config) {
        CONFIG.servers = conf.servers;
        CONFIG.logger = conf.logger;
        CONFIG.signalling = conf.signalling;
        CONFIG.connection = conf.connection;
    }

    on(event: EventType, callback: IEventHandler) {
        EventDispatcher.register(event, callback);
    }

    connect() {
        let message: IMessage = {
            type: 'offer',
            caller: null,
            data: null
        };
        CONFIG.signalling.send(message);
    }

    disconnect() {
        Object.entries(CONFIG.connection.channels)
            .forEach(([key, value]) => value.close());
        Object.entries(CONFIG.connection.peers)
            .forEach(([key, value]) => value.close());
    }

    peers(): IPeerCollection {
        return CONFIG.connection.peers;
    }

    channels(): IChannelCollection {
        return CONFIG.connection.channels;
    }
}
