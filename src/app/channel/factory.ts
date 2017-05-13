import { EventType } from './event-type';
import { EventDispatcher } from './../dispatcher/dispatcher';

export class DataChannelFactory {
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
