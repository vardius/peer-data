import { Caller } from './../connection/caller';
import { Room } from './../connection/room';

export interface DataEvent {
  room: Room;
  caller: Caller;
  data: any;
}
