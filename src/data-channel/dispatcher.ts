/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace DataChannel {
    export const HANDLERS: EventHandlerCollection = {};

    export class EventDispatcher {
        static register(type: EventType, callback: EventHandler) {
            if (!HANDLERS[type]) {
                HANDLERS[type] = [];
            }
            HANDLERS[type].push(callback);
        }

        static dispatch(type: EventType, data?: any) {
            HANDLERS[type].forEach(h => h(data));
        }
    }
}
