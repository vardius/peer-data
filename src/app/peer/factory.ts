import { EventDispatcher } from './../dispatcher/dispatcher';
import { Event } from './../connection/event';
import { EventType } from './../connection/event-type';

export class PeerFactory {
  static get(servers: RTCConfiguration, event: Event): RTCPeerConnection {
    const peer = new RTCPeerConnection(servers);

    peer.onicecandidate = (ideEvent: RTCPeerConnectionIceEvent) => {
      const message: Event = {
        type: EventType.CANDIDATE,
        caller: null,
        callee: event.caller,
        room: event.room,
        data: ideEvent.candidate,
      };
      EventDispatcher.dispatch('send', message);
    };
    return peer;
  }
}
