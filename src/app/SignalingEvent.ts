import { Identifiable } from "./Identifiable";

export interface SignalingEvent {
  type: string;
  room: Identifiable;
  caller: Identifiable;
  callee: Identifiable;
  payload: any;
}
