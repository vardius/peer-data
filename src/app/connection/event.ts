import { Caller } from './caller';
import { Room } from './room';

export interface Event {
  type: string;
  room: Room;
  caller: Caller;
  callee: Caller;
  data: any;
}
