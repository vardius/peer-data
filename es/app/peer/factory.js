import { EventDispatcher } from './../dispatcher/dispatcher';
import { EventType } from './../connection/event-type';
export class PeerFactory {
    static get(servers, event) {
        let peer = new RTCPeerConnection(servers);
        peer.onicecandidate = (ideEvent) => {
            let message = {
                type: EventType.CANDIDATE,
                caller: null,
                callee: event.caller,
                room: event.room,
                data: ideEvent.candidate
            };
            EventDispatcher.dispatch('send', message);
        };
        return peer;
    }
}
//# sourceMappingURL=factory.js.map