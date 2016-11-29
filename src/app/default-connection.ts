/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {Connection} from "./connection/connection";
import {PeerCollection} from "./peer/collection";
import {DataChannelCollection} from "./data-channel/collection";

export class DefaultConnection implements Connection {
    private _peers: PeerCollection = {};
    private _channels: DataChannelCollection = {};

    get peers(): PeerCollection {
        return this._peers;
    }

    get channels(): DataChannelCollection {
        return this._channels;
    }

    addPeer(id: string, peer: RTCPeerConnection): Connection {
        if (!this._peers.hasOwnProperty(id)) {
            this._peers[id] = peer;
        }
        return this;
    }

    removePeer(id: string): Connection {
        if (this._peers.hasOwnProperty(id)) {
            this._peers[id].close();
            delete this._peers[id];
            delete this._peers[id];
        }
        return this;
    }

    addChannel(id: string, channel: RTCDataChannel): Connection {
        if (!this._channels.hasOwnProperty(id)) {
            this._channels[id] = channel;
        }
        return this;
    }

    removeChannel(id: string): Connection {
        if (this._channels.hasOwnProperty(id)) {
            this._channels[id].close();
            delete this._channels[id];
        }
        return this;
    }
}
