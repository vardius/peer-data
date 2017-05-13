import { EventDispatcher } from './dispatcher/dispatcher';
import { EventType as SignalingEventType } from './connection/event-type';
import { Connection } from './connection/connection';
import { Bridge } from './bridge';
export class App {
    constructor(servers = {}, dataConstraints = null) {
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
    connect(roomId) {
        let event = {
            type: SignalingEventType.CONNECT,
            caller: null,
            callee: null,
            room: { id: roomId },
            data: null
        };
        EventDispatcher.dispatch('send', event);
    }
    disconnect(roomId) {
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
            room: { id: roomId },
            data: null
        };
        EventDispatcher.dispatch('send', event);
    }
}
//# sourceMappingURL=app.js.map