import { EventHandler } from './EventHandler';
export declare class EventDispatcher {
    static getInstance(): EventDispatcher;
    private static globalInstance;
    private handlers;
    register(type: string, callback: EventHandler): void;
    unregister(type: string, callback: EventHandler): void;
    dispatch(type: string, ...args: any[]): void;
}
