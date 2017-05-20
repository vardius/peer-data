import { Caller } from './../connection/caller';
import { Room } from './../connection/room';

export interface SignalingEvent {
  type: string;
  room: Room;
  caller: Caller;
  callee: Caller;
  data: any;
}
