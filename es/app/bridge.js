import { EventType } from './connection/event-type';
import { PeerFactory } from './peer/factory';
import { DataChannelFactory } from './channel/factory';
import { EventDispatcher } from './dispatcher/dispatcher';
import { EventType as DataEventType } from './channel/event-type';
const LABEL = 'chunks';
export class Bridge {
    constructor(connection) {
        this._connection = connection;
        EventDispatcher.register(EventType.CONNECT, this.onConnect.bind(this));
        EventDispatcher.register(EventType.DISCONNECT, this.onDisconnect.bind(this));
        EventDispatcher.register(EventType.OFFER, this.onOffer.bind(this));
        EventDispatcher.register(EventType.ANSWER, this.onAnswer.bind(this));
        EventDispatcher.register(EventType.CANDIDATE, this.onCandidate.bind(this));
    }
    get connection() {
        return this._connection;
    }
    set connection(value) {
        this._connection = value;
    }
    onConnect(event) {
        let peer = this._connection.peers[event.caller.id] = PeerFactory.get(this._connection.servers, event);
        let channel = peer.createDataChannel(LABEL, this._connection.dataConstraints);
        this._connection.channels[event.caller.id] = DataChannelFactory.get(channel);
        peer.createOffer((desc) => {
            let message = {
                type: EventType.OFFER,
                caller: null,
                callee: event.caller,
                room: event.room,
                data: desc
            };
            peer.setLocalDescription(desc, () => this.dispatchEvent(message), this.dispatchError);
        }, this.dispatchError);
    }
    onDisconnect(event) {
        let channel = this._connection.channels[event.caller.id];
        channel.close();
        let peer = this._connection.peers[event.caller.id];
        peer.close();
    }
    onOffer(event, signaling) {
        let peer = this._connection.peers[event.caller.id] = PeerFactory.get(this._connection.servers, event);
        peer.ondatachannel = (dataChannelEvent) => {
            this._connection.addChannel(event.caller.id, DataChannelFactory.get(dataChannelEvent.channel));
        };
        peer.setRemoteDescription(new RTCSessionDescription(event.data), () => {
        }, this.dispatchError);
        peer.createAnswer((desc) => {
            let message = {
                type: EventType.ANSWER,
                caller: null,
                callee: event.caller,
                room: event.room,
                data: desc
            };
            peer.setLocalDescription(desc, () => this.dispatchEvent(message), this.dispatchError);
        }, this.dispatchError);
    }
    onAnswer(event) {
        let peer = this._connection.peers[event.caller.id];
        peer.setRemoteDescription(new RTCSessionDescription(event.data), () => { }, this.dispatchError);
    }
    onCandidate(event) {
        if (event.data) {
            let peer = this._connection.peers[event.caller.id];
            peer.addIceCandidate(new RTCIceCandidate(event.data));
        }
    }
    dispatchEvent(event) {
        EventDispatcher.dispatch('send', event);
    }
    dispatchError(event) {
        EventDispatcher.dispatch(DataEventType.ERROR, event);
    }
}
//# sourceMappingURL=bridge.js.map