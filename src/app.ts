/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// import "webrtc-adapter";
import Config, {config} from "./config";
import {connection} from "./connection";
import EventDispatcher, {EventType, IEventHandler} from "./event";
import {IPeerCollection} from "./peer";
import {IChannelCollection} from "./channel";
import {signaling} from "./signaling";
import {IMessage} from "./bridge";

export interface IApp {
    on(event: EventType, callback: IEventHandler): void;
    connect(): void;
    disconnect(): void;
    peers(): IPeerCollection
    channels(): IChannelCollection
}

export default class App implements IApp {

    constructor(conf: Config) {
        config.config = conf;
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
        signaling.send(message);
    }

    disconnect() {
        Object.entries(connection.channels())
            .forEach(([key, value]) => value.close());
        Object.entries(connection.peers())
            .forEach(([key, value]) => value.close());
    }

    peers(): IPeerCollection {
        return connection.peers();
    }

    channels(): IChannelCollection {
        return connection.channels();
    }
}
