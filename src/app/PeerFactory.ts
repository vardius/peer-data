import { EventDispatcher } from './EventDispatcher';
import { SignalingEvent } from './SignalingEvent';
import { SignalingEventType } from './SignalingEventType';
import { AppEventType } from './AppEventType';

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

        EventDispatcher.dispatch(AppEventType.SEND, message);
      } else {
        // All ICE candidates have been sent
      }
    };

    return peer;
  }
}
