import { EventDispatcher } from './../dispatcher/dispatcher';
import { SignalingEvent } from './../signaling/event';
import { SignalingEventType } from './../signaling/event-type';

export class PeerFactory {
  static get(servers: RTCConfiguration, event: SignalingEvent): RTCPeerConnection {
    const peer = new RTCPeerConnection(servers);

    peer.onicecandidate = (iceEvent: RTCPeerConnectionIceEvent) => {
      if (iceEvent.candidate) {
        const message: SignalingEvent = {
          type: SignalingEventType.CANDIDATE,
          caller: null,
          callee: event.caller,
          room: event.room,
          data: iceEvent.candidate,
        };

        EventDispatcher.dispatch('send', message);
      } else {
        // All ICE candidates have been sent
      }
    };

    return peer;
  }
}
