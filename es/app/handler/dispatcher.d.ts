/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { EventType } from './event-type';
import { EventHandler } from './handler';
export declare class EventDispatcher {
    static register(type: EventType, callback: EventHandler): void;
    static dispatch(type: EventType, data?: any): void;
}
