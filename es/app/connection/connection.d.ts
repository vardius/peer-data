/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { PeerCollection } from '../peer/collection';
import { DataChannelCollection } from '../channel/collection';
export declare class Connection {
    private _servers;
    private _dataConstraints?;
    private _peers;
    private _channels;
    constructor(servers?: RTCConfiguration, dataConstraints?: RTCDataChannelInit);
    readonly peers: PeerCollection;
    readonly channels: DataChannelCollection;
    addPeer(id: string, peer: RTCPeerConnection): Connection;
    removePeer(id: string): Connection;
    addChannel(id: string, channel: RTCDataChannel): Connection;
    removeChannel(id: string): Connection;
    servers: RTCConfiguration;
    dataConstraints: RTCDataChannelInit;
}
