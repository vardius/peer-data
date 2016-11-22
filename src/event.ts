/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const handlers: IEventHandlerCollection = {};

export interface IEventHandler {
    (data?);
}

export interface IEventHandlerCollection {
    [index: string]: IEventHandler[];
}

export enum EventType {
    OPEN,
    CLOSE,
    ERROR,
    DATA
}

export default class EventDispatcher {
    static register(type: EventType, callback: IEventHandler) {
        if (!handlers[type]) {
            handlers[type] = [];
        }
        handlers[type].push(callback);
    }

    static dispatch(type: EventType, data?) {
        handlers[type].forEach(h => h(data));
    }
}
