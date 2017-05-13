import { EventType } from '../signaling/event-type';
export class PeerFactory {
    static get(servers, signaling) {
        let peer = new RTCPeerConnection(servers);
        peer.onicecandidate = (event) => {
            let message = {
                type: EventType.CANDIDATE,
                caller: null,
                callee: null,
                data: event.candidate
            };
            signaling.send(message);
        };
        return peer;
    }
}
//# sourceMappingURL=factory.js.map