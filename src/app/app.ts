/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Config} from "./config";

export const CONFIG = new Config();

export class App {
    constructor(conf: Config) {
        CONFIG.servers = conf.servers;
        CONFIG.logger = conf.logger;
        CONFIG.signalling = conf.signalling;
        CONFIG.connection = conf.connection;
    }

    on(event: DataChannel.EventType, callback: EventHandler) {
        DataChannel.EventDispatcher.register(event, callback);
    }

    connect() {
        let event: Signaling.SignalingEvent = {
            type: Signaling.EventType.CONNECT,
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
                let event: Signaling.SignalingEvent = {
                    type: Signaling.EventType.DISCONNECT,
                    caller: null,
                    callee: null,
                    data: null
                };
                CONFIG.signalling.send(event);
            });
    }

    peers(): Peer.PeerCollection {
        return CONFIG.connection.peers;
    }

    channels(): DataChannel.DataChannelCollection {
        return CONFIG.connection.channels;
    }
}
