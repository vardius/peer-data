import { EventHandler } from './EventHandler';

export interface EventHandlerCollection {
    [type: string]: EventHandler[];
}
