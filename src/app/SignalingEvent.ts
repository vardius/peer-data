import { Caller } from './Caller';
import { Room } from './Room';

export interface SignalingEvent {
  type: string;
  room: Room;
  caller: Caller;
  callee: Caller;
  data: any;
}
