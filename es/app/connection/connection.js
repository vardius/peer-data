export class Connection {
    constructor(servers = {}, dataConstraints = null) {
        this._servers = {};
        this._dataConstraints = null;
        this._peers = {};
        this._channels = {};
        this._servers = servers;
        this._dataConstraints = dataConstraints;
    }
    get peers() {
        return this._peers;
    }
    get channels() {
        return this._channels;
    }
    addPeer(id, peer) {
        if (!this._peers.hasOwnProperty(id)) {
            this._peers[id] = peer;
        }
        return this;
    }
    removePeer(id) {
        if (this._peers.hasOwnProperty(id)) {
            this._peers[id].close();
            delete this._peers[id];
            delete this._peers[id];
        }
        return this;
    }
    addChannel(id, channel) {
        if (!this._channels.hasOwnProperty(id)) {
            this._channels[id] = channel;
        }
        return this;
    }
    removeChannel(id) {
        if (this._channels.hasOwnProperty(id)) {
            this._channels[id].close();
            delete this._channels[id];
        }
        return this;
    }
    get servers() {
        return this._servers;
    }
    set servers(value) {
        this._servers = value;
    }
    get dataConstraints() {
        return this._dataConstraints;
    }
    set dataConstraints(value) {
        this._dataConstraints = value;
    }
}
//# sourceMappingURL=connection.js.map