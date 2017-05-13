import { EventType as SignalingEventType } from './signaling/event-type';
import { PeerFactory } from './peer/factory';
import { DataChannelFactory } from './channel/factory';
import { EventDispatcher } from './handler/dispatcher';
import { EventType as HandlerEventType } from './handler/event-type';
const LABEL = 'chunks';
export class Bridge {
    constructor(connection) {
        this._connection = connection;
    }
    onConnect(event, signaling) {
        let peer = this._connection.peers[event.caller.id] = PeerFactory.get(this._connection.servers, signaling);
        let channel = peer.createDataChannel(LABEL, this._connection.dataConstraints);
        this._connection.channels[event.caller.id] = DataChannelFactory.get(channel);
        peer.createOffer((desc) => {
            let message = {
                type: SignalingEventType.OFFER,
                caller: null,
                callee: event.caller,
                data: desc
            };
            peer.setLocalDescription(desc, () => signaling.send(message), this.dispatchError);
        }, this.dispatchError);
    }
    onCandidate(event) {
        if (event.data) {
            let peer = this._connection.peers[event.caller.id];
            peer.addIceCandidate(new RTCIceCandidate(event.data));
        }
    }
    onOffer(event, signaling) {
        let peer = this._connection.peers[event.caller.id] = PeerFactory.get(this._connection.servers, signaling);
        peer.ondatachannel = (dataChannelEvent) => {
            this._connection.addChannel(event.caller.id, DataChannelFactory.get(dataChannelEvent.channel));
        };
        peer.setRemoteDescription(new RTCSessionDescription(event.data), () => {
        }, this.dispatchError);
        peer.createAnswer((desc) => {
            let message = {
                type: SignalingEventType.ANSWER,
                caller: null,
                callee: event.caller,
                data: desc
            };
            peer.setLocalDescription(desc, () => signaling.send(message), this.dispatchError);
        }, this.dispatchError);
    }
    onAnswer(event) {
        let peer = this._connection.peers[event.caller.id];
        peer.setRemoteDescription(new RTCSessionDescription(event.data), () => {
        }, this.dispatchError);
    }
    onDisconnect(event) {
        let channel = this._connection.channels[event.caller.id];
        channel.close();
        let peer = this._connection.peers[event.caller.id];
        peer.close();
    }
    get connection() {
        return this._connection;
    }
    set connection(value) {
        this._connection = value;
    }
    dispatchError(event) {
        EventDispatcher.dispatch(HandlerEventType.ERROR, event);
    }
}
//# sourceMappingURL=bridge.js.map