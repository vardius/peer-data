import { EventDispatcher } from './EventDispatcher';

export class Connection {
  private _rooms: string[] = [];
  private _peers: Map<string, RTCPeerConnection> = new Map();
  private _channels: Map<string, RTCDataChannel> = new Map();
  private _handlers: Map<string, Map<string, EventHandler>> = new Map();

  constructor() { }

  get rooms(): string[] {
    return this._rooms;
  }

  get peers(): Map<string, RTCPeerConnection> {
    return this._peers;
  }

  get channels(): Map<string, RTCDataChannel> {
    return this._channels;
  }

  get handlers(): Map<string, Map<string, EventHandler>> {
    return this._handlers;
  }

  addPeer(id: string, peer: RTCPeerConnection): Connection {
    if (!this._peers.has(id)) {
      this._peers.set(id, peer);

      peer.onconnectionstatechange = (event: Event) => {
        if (peer.connectionState === 'closed') {
          this.removePeer(id);
        }
      };
    }

    return this;
  }

  getPeer(id: string): RTCPeerConnection {
    if (this._peers.has(id)) {
      return this._peers.get(id);
    }

    return null;
  }

  removePeer(id: string): Connection {
    if (this._peers.has(id)) {
      this._peers.get(id).close();
      this._peers.delete(id);

      // todo: refactor when typescript supports map
      const hMap = this._handlers.get(id);
      const keys = Array.from(hMap.keys());
      for (const key of keys) {
        EventDispatcher.unregister(key, hMap.get(key));
      }
    }

    return this;
  }

  addChannel(id: string, channel: RTCDataChannel): Connection {
    if (!this._channels.has(id)) {
      this._channels.set(id, channel);

      channel.onclose = (event: Event) => this.removeChannel(id);
    }

    return this;
  }

  getChannel(id: string): RTCDataChannel {
    if (this._channels.has(id)) {
      return this._channels.get(id);
    }

    return null;
  }

  removeChannel(id: string): Connection {
    if (this._channels.has(id)) {
      this._channels.get(id).close();
      this._channels.delete(id);
    }

    return this;
  }

  addRoom(id: string): Connection {
    if (this._rooms.indexOf(id) === -1) {
      this._rooms.push(id);
    }

    return this;
  }

  hasRoom(id: string): boolean {
    return this._rooms.indexOf(id) !== -1;
  }

  removeRoom(id: string): Connection {
    const index = this._rooms.indexOf(id);
    if (index !== -1) {
      this._rooms.splice(index, 1);
    }

    if (this._rooms.length === 0) {
      Object
        .entries(this.channels)
        .forEach(([key, value]) => this.removeChannel(key));

      Object
        .entries(this.peers)
        .forEach(([key, value]) => this.removePeer(key));
    }

    return this;
  }
}
