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
