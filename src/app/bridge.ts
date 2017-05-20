import { Connection } from './connection/connection';
import { EventDispatcher } from './dispatcher/dispatcher';
import { ConnectionEvent } from './connection/event';
import { ConnectionEventType } from './connection/event-type';
import { PeerFactory } from './peer/factory';
import { DataChannelFactory } from './channel/factory';
import { PeerCollection } from './peer/collection';
import { DataChannelCollection } from './channel/collection';
import { DataEvent } from './channel/event';
import { DataEventType } from './channel/event-type';
import { PeerEvent } from './peer/event';
import { PeerEventType } from './peer/event-type';

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

    this.dispatchPeerEvent(peer, event);

    peer.createOffer(
      (desc: RTCSessionDescription) => {
        const message: ConnectionEvent = {
          type: ConnectionEventType.OFFER,
          caller: null,
          callee: event.caller,
          room: event.room,
          data: desc,
        };

        this.setLocalDescription(peer, desc).then(
          () => this.dispatchEvent(message),
          (evnt: DOMException) => this.dispatchError(event, evnt),
        );
      },
      (evnt: DOMException) => this.dispatchError(event, evnt),
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

    this.dispatchPeerEvent(peer, event);

    peer.ondatachannel = (dataChannelEvent: RTCDataChannelEvent) => {
      const channel = DataChannelFactory.subscribeToEvents(dataChannelEvent.channel, this._channels, event);
      this._connection.addChannel(event.caller.id, channel);
    };

    this.setRemoteDescription(peer, new RTCSessionDescription(event.data)).then(
      () => { },
      (evnt: DOMException) => this.dispatchError(event, evnt),
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

        this.setLocalDescription(peer, desc).then(
          () => this.dispatchEvent(message),
          (evnt: DOMException) => this.dispatchError(event, evnt),
        );
      },
      (evnt: DOMException) => this.dispatchError(event, evnt),
    );
  }

  onAnswer(event: ConnectionEvent) {
    const peer = this._peers[event.caller.id];
    this.setRemoteDescription(peer, new RTCSessionDescription(event.data)).then(
      () => { },
      (evnt: DOMException) => this.dispatchError(event, evnt),
    );
  }

  onCandidate(event: ConnectionEvent) {
    const peer = this._peers[event.caller.id];
    const candidate = new RTCIceCandidate(event.data);

    peer.addIceCandidate(candidate).then(
      () => { },
      (evnt: DOMException) => this.dispatchError(event, evnt),
    );
  }

  private setLocalDescription(peer: RTCPeerConnection, desc: RTCSessionDescription): Promise<void> {
    return peer.setLocalDescription(desc);
  }

  private setRemoteDescription(peer: RTCPeerConnection, desc: RTCSessionDescription): Promise<void> {
    return peer.setRemoteDescription(desc);
  }

  private dispatchPeerEvent(peer: RTCPeerConnection, event: ConnectionEvent) {
    const message: PeerEvent = {
      peer,
      caller: event.caller,
      room: event.room,
    };
    EventDispatcher.dispatch(PeerEventType.CREATED, message);
  }

  private dispatchEvent(event: ConnectionEvent) {
    EventDispatcher.dispatch('send', event);
  }

  private dispatchError(cEvent: ConnectionEvent, event: DOMException) {
    const message: DataEvent = {
      caller: cEvent.caller,
      room: cEvent.room,
      data: event.message,
    };
    EventDispatcher.dispatch(DataEventType.ERROR, message);
  }
}
