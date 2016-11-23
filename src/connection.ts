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

export interface IConnection {
    peers: IPeerCollection
    channels: IChannelCollection

    addPeer(id: string, peer: RTCPeerConnection): IConnection
    removePeer(id: string): IConnection
    addChannel(id: string, channel: RTCDataChannel): IConnection
    removeChannel(id: string): IConnection
}

export class Connection implements IConnection {
    private _peers: IPeerCollection;
    private _channels: IChannelCollection;

    get peers(): IPeerCollection {
        return this._peers;
    }

    get channels(): IChannelCollection {
        return this._channels;
    }

    addPeer(id: string, peer: RTCPeerConnection): IConnection {
        if (!this._peers.hasOwnProperty(id)) {
            this._peers[id] = peer;
        }
        return this;
    }

    removePeer(id: string): IConnection {
        if (this._peers.hasOwnProperty(id)) {
            this._peers[id].close();
            delete this._peers[id];
            delete this._peers[id];
        }
        return this;
    }

    addChannel(id: string, channel: RTCDataChannel): IConnection {
        if (!this._channels.hasOwnProperty(id)) {
            this._channels[id] = channel;
        }
        return this;
    }

    removeChannel(id: string): IConnection {
        if (this._channels.hasOwnProperty(id)) {
            this._channels[id].close();
            delete this._channels[id];
        }
        return this;
    }
}
