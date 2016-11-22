/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import EventDispatcher, {EventType} from "./event";

export interface IChannelCollection {
    [index: string]: RTCDataChannel;
}

export default class DataChannelFactory {
    public static get(channel: RTCDataChannel): RTCDataChannel {
        channel.onopen = this.onOpen.bind(this);
        channel.onmessage = this.onMessage.bind(this);
        channel.onerror = this.onError.bind(this);
        channel.onclose = this.onClose.bind(this);

        return channel;
    }

    private static onMessage(event: MessageEvent) {
        EventDispatcher.dispatch(EventType.DATA, event);
    }

    private static onOpen(event: Event) {
        EventDispatcher.dispatch(EventType.OPEN, event);
    }

    private static onClose(event: Event) {
        EventDispatcher.dispatch(EventType.CLOSE, event);
    }

    private static onError(event: Event) {
        EventDispatcher.dispatch(EventType.ERROR, event);
    }
}