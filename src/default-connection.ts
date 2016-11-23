/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class DefaultConnection implements Connection.Connection {
    private _peers: Peer.PeerCollection;
    private _channels: DataChannel.DataChannelCollection;

    get peers(): Peer.PeerCollection {
        return this._peers;
    }

    get channels(): DataChannel.DataChannelCollection {
        return this._channels;
    }

    addPeer(id: string, peer: RTCPeerConnection): Connection.Connection {
        if (!this._peers.hasOwnProperty(id)) {
            this._peers[id] = peer;
        }
        return this;
    }

    removePeer(id: string): Connection.Connection {
        if (this._peers.hasOwnProperty(id)) {
            this._peers[id].close();
            delete this._peers[id];
            delete this._peers[id];
        }
        return this;
    }

    addChannel(id: string, channel: RTCDataChannel): Connection.Connection {
        if (!this._channels.hasOwnProperty(id)) {
            this._channels[id] = channel;
        }
        return this;
    }

    removeChannel(id: string): Connection.Connection {
        if (this._channels.hasOwnProperty(id)) {
            this._channels[id].close();
            delete this._channels[id];
        }
        return this;
    }
}
