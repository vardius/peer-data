import { Caller } from './Caller';
import { Room } from './Room';

export interface AppEvent {
  room: Room;
  caller: Caller;
  data?: any;
}
