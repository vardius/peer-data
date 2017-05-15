import { Connection } from './connection/connection';
import { EventDispatcher } from './dispatcher/dispatcher';
import { ConnectionEvent } from './connection/event';
import { ConnectionEventType } from './connection/event-type';
import { DataEventType } from './channel/event-type';
import { PeerFactory } from './peer/factory';
import { DataChannelFactory } from './channel/factory';
import { PeerCollection } from './peer/collection';
import { DataChannelCollection } from './channel/collection';
import { Caller } from './connection/caller';
import { DataEvent } from './channel/event';

export class Bridge {
  private _connection: Connection;
  private _peers: PeerCollection = {};
  private _channels: DataChannelCollection = {};

  constructor(connection: Connection) {
    this._connection = connection;

    this._peers = this._connection.peers;
    this._channels = this._connection.channels;

    EventDispatcher.register(ConnectionEventType.CONNECT, this.onConnect.bind(this));
    EventDispatcher.register(ConnectionEventType.DISCONNECT, this.onDisconnect.bind(this));
    EventDispatcher.register(ConnectionEventType.OFFER, this.onOffer.bind(this));
    EventDispatcher.register(ConnectionEventType.ANSWER, this.onAnswer.bind(this));
    EventDispatcher.register(ConnectionEventType.CANDIDATE, this.onCandidate.bind(this));
  }

  get connection(): Connection {
    return this._connection;
  }

  set connection(value: Connection) {
    this._connection = value;
  }

  onConnect(event: ConnectionEvent) {
    const peer = this._peers[event.caller.id] = PeerFactory.get(this._connection.servers, event);
    const channel = DataChannelFactory.get(peer, this._connection.dataConstraints);

    this._channels[event.caller.id] = DataChannelFactory.subscribeToEvents(channel, this._channels, event);
    this._peers[event.caller.id] = peer;

    peer.createOffer(
      (desc: RTCSessionDescription) => {
        const message: ConnectionEvent = {
          type: ConnectionEventType.OFFER,
          caller: null,
          callee: event.caller,
          room: event.room,
          data: desc,
        };

        peer.setLocalDescription(
          desc,
          () => this.dispatchEvent(message),
          (evnt: DOMException) => this.dispatchError(event.caller, evnt),
        );
      },
      (evnt: DOMException) => this.dispatchError(event.caller, evnt),
    );
  }

  onDisconnect(event: ConnectionEvent) {
    const channel = this._channels[event.caller.id];
    const peer = this._peers[event.caller.id];

    channel.close();
    peer.close();

    delete this._channels[event.caller.id];
    delete this._peers[event.caller.id];
  }

  onOffer(event: ConnectionEvent) {
    const peer = PeerFactory.get(this._connection.servers, event);
    this._peers[event.caller.id] = peer;

    peer.ondatachannel = (dataChannelEvent: RTCDataChannelEvent) => {
      const channel = DataChannelFactory.subscribeToEvents(dataChannelEvent.channel, this._channels, event);
      this._connection.addChannel(event.caller.id, channel);
    };

    peer.setRemoteDescription(
      new RTCSessionDescription(event.data),
      () => { },
      (evnt: DOMException) => this.dispatchError(event.caller, evnt),
    );

    peer.createAnswer(
      (desc: RTCSessionDescription) => {
        const message: ConnectionEvent = {
          type: ConnectionEventType.ANSWER,
          caller: null,
          callee: event.caller,
          room: event.room,
          data: desc,
        };

        peer.setLocalDescription(
          desc,
          () => this.dispatchEvent(message),
          (evnt: DOMException) => this.dispatchError(event.caller, evnt),
        );
      },
      (evnt: DOMException) => this.dispatchError(event.caller, evnt),
    );
  }

  onAnswer(event: ConnectionEvent) {
    const peer = this._peers[event.caller.id];
    peer.setRemoteDescription(
      new RTCSessionDescription(event.data),
      () => { },
      (evnt: DOMException) => this.dispatchError(event.caller, evnt),
    );
  }

  onCandidate(event: ConnectionEvent) {
    if (event.data) {
      const peer = this._peers[event.caller.id];
      peer.addIceCandidate(new RTCIceCandidate(event.data));
    }
  }

  private dispatchEvent(event: ConnectionEvent) {
    EventDispatcher.dispatch('send', event);
  }

  private dispatchError(caller: Caller, event: DOMException) {
    const message: DataEvent = {
      id: caller.id,
      event,
    };
    EventDispatcher.dispatch(DataEventType.ERROR, message);
  }
}
