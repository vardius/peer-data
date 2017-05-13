import { EventDispatcher } from './handler/dispatcher';
import { EventType as SignalingEventType } from './signaling/event-type';
import { Connection } from './connection/connection';
import { Bridge } from './bridge';
export class App {
    constructor(servers = {}, dataConstraints = null) {
        this._signaling = null;
        const connection = new Connection(servers, dataConstraints);
        this.bridge = new Bridge(connection);
    }
    on(event, callback) {
        EventDispatcher.register(event, callback);
    }
    send(data, id) {
        if (id) {
            const channel = this.bridge.connection.channels[id];
            if (channel) {
                channel.send(data);
            }
        }
        else {
            Object
                .entries(this.bridge.connection.channels)
                .forEach(([key, value]) => value.send(data));
        }
    }
    connect() {
        let event = {
            type: SignalingEventType.CONNECT,
            caller: null,
            callee: null,
            data: null
        };
        this._signaling.send(event);
    }
    disconnect() {
        Object
            .entries(this.bridge.connection.channels)
            .forEach(([key, value]) => value.close());
        Object
            .entries(this.bridge.connection.peers)
            .forEach(([key, value]) => value.close());
        const event = {
            type: SignalingEventType.DISCONNECT,
            caller: null,
            callee: null,
            data: null
        };
        this._signaling.send(event);
    }
    get servers() {
        return this.bridge.connection.servers;
    }
    set servers(value) {
        this.bridge.connection.servers = value;
    }
    get dataConstraints() {
        return this.bridge.connection.dataConstraints;
    }
    set dataConstraints(value) {
        this.bridge.connection.dataConstraints = value;
    }
    get signaling() {
        return this._signaling;
    }
    set signaling(value) {
        this._signaling = value;
    }
}
//# sourceMappingURL=app.js.map