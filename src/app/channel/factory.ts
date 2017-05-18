import { DataEventType } from './event-type';
import { DataEvent } from './event';
import { ConnectionEvent } from './../connection/event';
import { EventDispatcher } from './../dispatcher/dispatcher';
import { DataChannelCollection } from './collection';

export class DataChannelFactory {
  public static get(peer: RTCPeerConnection, dataConstraints: RTCDataChannelInit): RTCDataChannel {
    const label = Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);

    return peer.createDataChannel(label, dataConstraints);
  }

  public static subscribeToEvents(channel: RTCDataChannel, channels: DataChannelCollection, event: ConnectionEvent) {
    channel.onmessage = (channelEvent: MessageEvent) => {
      const message: DataEvent = {
        caller: event.caller,
        room: event.room,
        event: channelEvent,
      };
      EventDispatcher.dispatch(DataEventType.DATA, message);
    };

    channel.onopen = (channelEvent: Event) => {
      const message: DataEvent = {
        caller: event.caller,
        room: event.room,
        event: channelEvent,
      };
      EventDispatcher.dispatch(DataEventType.OPEN, message);
    };

    channel.onclose = (channelEvent: Event) => {
      const message: DataEvent = {
        caller: event.caller,
        room: event.room,
        event: channelEvent,
      };
      EventDispatcher.dispatch(DataEventType.CLOSE, message);

      delete channels[event.caller.id];
    };

    channel.onerror = (channelEvent: Event) => {
      const message: DataEvent = {
        caller: event.caller,
        room: event.room,
        event: channelEvent,
      };
      EventDispatcher.dispatch(DataEventType.ERROR, message);
    };

    return channel;
  }
}
