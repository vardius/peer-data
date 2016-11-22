/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import EventDispatcher, {EventType} from "./event";

export default class DataChannelFactory {
    public static get(channel: RTCDataChannel): RTCDataChannel {
        channel.onopen = this.onOpen.bind(this);
        channel.onmessage = this.onMessage.bind(this);
        channel.onerror = this.onError.bind(this);
        channel.onclose = this.onClose.bind(this);

        return channel;
    }

    private static onMessage(event: RTCMessageEvent) {
        console.log(event);
        EventDispatcher.dispatch(EventType.DATA, event);
    }

    private static onOpen(event: Event) {
        console.log(event);
        EventDispatcher.dispatch(EventType.OPEN, event);
    }

    private static onClose(event: Event) {
        console.log(event);
        EventDispatcher.dispatch(EventType.CLOSE, event);
    }

    private static onError(event: Event) {
        console.log(event);
        EventDispatcher.dispatch(EventType.ERROR, event);
    }
}
