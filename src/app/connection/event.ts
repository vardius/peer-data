import { Caller } from './caller';
import { Room } from './room';

export interface ConnectionEvent {
  type: string;
  room: Room;
  caller: Caller;
  callee: Caller;
  data: any;
}
