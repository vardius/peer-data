/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {IPeerCollection} from "./peer";
import {IChannelCollection} from "./channel";
import EventDispatcher, {EventType, IEventHandler} from "./event";

export interface IConnection {
    peers(): IPeerCollection
    addPeer(id: string, peer: RTCPeerConnection): IConnection
    removePeer(id): IConnection
    channels(): IChannelCollection
    addChannel(id: string, channel: RTCDataChannel): IConnection
    removeChannel(id): IConnection
    on(event: EventType, callback: IEventHandler);
}

class Connection implements IConnection {
    private _peers: IPeerCollection;
    private _channels: IChannelCollection;

    on(event: EventType, callback: IEventHandler) {
        EventDispatcher.register(event, callback);
    }

    peers(): IPeerCollection {
        return this._peers;
    }

    addPeer(id: string, peer: RTCPeerConnection): IConnection {
        if (!this._peers.hasOwnProperty(id)) {
            this._peers[id] = peer;
        }
        return this;
    }

    removePeer(id): IConnection {
        if (this._peers.hasOwnProperty(id)) {
            this._peers[id].close();
            delete this._peers[id];
            delete this._peers[id];
        }
        return this;
    }

    channels(): IChannelCollection {
        return this._channels;
    }

    addChannel(id: string, channel: RTCDataChannel): IConnection {
        if (!this._channels.hasOwnProperty(id)) {
            this._channels[id] = channel;
        }
        return this;
    }

    removeChannel(id): IConnection {
        if (this._channels.hasOwnProperty(id)) {
            this._channels[id].close();
            delete this._channels[id];
        }
        return this;
    }
}

export const connection: IConnection = new Connection();