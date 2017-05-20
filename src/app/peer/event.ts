import { Caller } from './../connection/caller';

export interface PeerEvent {
  peer: RTCPeerConnection;
  caller: Caller;
}
