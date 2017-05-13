import { EventType } from './event-type';
import { EventDispatcher } from './../dispatcher/dispatcher';
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