import { PeerCollection } from '../peer/collection';
import { DataChannelCollection } from '../channel/collection';

export class Connection {
  private _servers: RTCConfiguration = {};
  private _dataConstraints?: RTCDataChannelInit = null;
  private _peers: PeerCollection = {};
  private _channels: DataChannelCollection = {};

  constructor(servers: RTCConfiguration = {}, dataConstraints: RTCDataChannelInit = null) {
    this._servers = servers;
    this._dataConstraints = dataConstraints;
  }

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

  get servers(): RTCConfiguration {
    return this._servers;
  }

  set servers(value: RTCConfiguration) {
    this._servers = value;
  }

  get dataConstraints(): RTCDataChannelInit {
    return this._dataConstraints;
  }

  set dataConstraints(value: RTCDataChannelInit) {
    this._dataConstraints = value;
  }
}
