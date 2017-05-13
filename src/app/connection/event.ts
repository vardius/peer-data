import { Caller } from './caller';
import { Room } from './room';
import { EventType } from './../connection/event-type';

export interface Event {
  type: EventType;
  room: Room;
  caller: Caller;
  callee: Caller;
  data: any;
}
