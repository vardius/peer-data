import { DataEventType } from './event-type';
import { DataEvent } from './event';
import { ConnectionEvent } from './../connection/event';
import { EventDispatcher } from './../dispatcher/dispatcher';
import { DataChannelCollection } from './collection';

const LABEL = 'chunks';

export class DataChannelFactory {
  public static get(peer: RTCPeerConnection, dataConstraints: RTCDataChannelInit): RTCDataChannel {
    return peer.createDataChannel(LABEL, dataConstraints);
  }

  public static subscribeToEvents(channel: RTCDataChannel, channels: DataChannelCollection, event: ConnectionEvent) {
    channel.onmessage = (channelEvent: MessageEvent) => {
      const message: DataEvent = {
        id: event.caller.id,
        event: channelEvent,
      };
      EventDispatcher.dispatch(DataEventType.DATA, message);
    };

    channel.onopen = (channelEvent: Event) => {
      const message: DataEvent = {
        id: event.caller.id,
        event: channelEvent,
      };
      EventDispatcher.dispatch(DataEventType.OPEN, message);
    };

    channel.onclose = (channelEvent: Event) => {
      const message: DataEvent = {
        id: event.caller.id,
        event: channelEvent,
      };
      EventDispatcher.dispatch(DataEventType.CLOSE, message);

      delete channels[event.caller.id];
    };

    channel.onerror = (channelEvent: Event) => {
      const message: DataEvent = {
        id: event.caller.id,
        event: channelEvent,
      };
      EventDispatcher.dispatch(DataEventType.ERROR, message);
    };

    return channel;
  }
}
