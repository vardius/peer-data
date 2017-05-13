import { EventHandler } from './handler';
export declare class EventDispatcher {
    static register(type: any, callback: EventHandler): void;
    static dispatch(type: any, data?: any): void;
}
