import { Caller } from './connection/caller';
import { Room } from './connection/room';

export interface AppEvent {
  room: Room;
  caller: Caller;
  data: any;
}
