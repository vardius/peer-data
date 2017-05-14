import { EventDispatcher } from './../dispatcher/dispatcher';
import { ConnectionEvent } from './../connection/event';
import { ConnectionEventType } from './../connection/event-type';

export class PeerFactory {
  static get(servers: RTCConfiguration, event: ConnectionEvent): RTCPeerConnection {
    const peer = new RTCPeerConnection(servers);

    peer.onicecandidate = (iceEvent: RTCPeerConnectionIceEvent) => {
      const message: ConnectionEvent = {
        type: ConnectionEventType.CANDIDATE,
        caller: null,
        callee: event.caller,
        room: event.room,
        data: iceEvent.candidate,
      };
      EventDispatcher.dispatch('send', message);
    };

    return peer;
  }
}
