/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Config} from "./config";
import {EventType} from "./data-channel/event-type";
import {EventDispatcher} from "./data-channel/dispatcher";
import {SignalingEvent} from "./signaling/event";
import {PeerCollection} from "./peer/collection";
import {DataChannelCollection} from "./data-channel/collection";
import {SignalingEventType} from "./signaling/event-type";

export const CONFIG = <Config>{
    servers: null,
    logger: null,
    signalling: null,
    connection: null,
};

export class App {
    constructor(conf?: Config) {
        if (conf) {
            CONFIG.servers = conf.servers;
            CONFIG.logger = conf.logger;
            CONFIG.signalling = conf.signalling;
            CONFIG.connection = conf.connection;
        }
    }

    on(event: EventType, callback: EventHandler) {
        EventDispatcher.register(event, callback);
    }

    connect() {
        let event: SignalingEvent = {
            type: SignalingEventType.CONNECT,
            caller: null,
            callee: null,
            data: null
        };
        CONFIG.signalling.send(event);
    }

    disconnect() {
        Object.entries(CONFIG.connection.channels)
            .forEach(([key, value]) => value.close());
        Object.entries(CONFIG.connection.peers)
            .forEach(([key, value]) => {
                value.close();
                let event: SignalingEvent = {
                    type: SignalingEventType.DISCONNECT,
                    caller: null,
                    callee: null,
                    data: null
                };
                CONFIG.signalling.send(event);
            });
    }

    peers(): PeerCollection {
        return CONFIG.connection.peers;
    }

    channels(): DataChannelCollection {
        return CONFIG.connection.channels;
    }
}
