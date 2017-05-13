import { EventHandler } from './handler';
export interface EventHandlerCollection {
    [index: string]: EventHandler[];
}
