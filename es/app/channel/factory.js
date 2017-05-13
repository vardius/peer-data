/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { EventType } from './../handler/event-type';
import { EventDispatcher } from './../handler/dispatcher';
export class DataChannelFactory {
    static get(channel) {
        channel.onopen = this.onOpen.bind(this);
        channel.onmessage = this.onMessage.bind(this);
        channel.onerror = this.onError.bind(this);
        channel.onclose = this.onClose.bind(this);
        return channel;
    }
    static onMessage(event) {
        EventDispatcher.dispatch(EventType.DATA, event);
    }
    static onOpen(event) {
        EventDispatcher.dispatch(EventType.OPEN, event);
    }
    static onClose(event) {
        EventDispatcher.dispatch(EventType.CLOSE, event);
    }
    static onError(event) {
        EventDispatcher.dispatch(EventType.ERROR, event);
    }
}
//# sourceMappingURL=factory.js.map