import { Caller } from './../connection/caller';
import { Room } from './../connection/room';

export interface PeerEvent {
  peer: RTCPeerConnection;
  caller: Caller;
  room: Room;
}
