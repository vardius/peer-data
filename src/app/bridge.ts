import { Connection } from './connection/connection';
import { EventDispatcher } from './dispatcher/dispatcher';
import { SignalingEvent } from './signaling/event';
import { SignalingEventType } from './signaling/event-type';
import { PeerFactory } from './peer/factory';
import { DataChannelFactory } from './channel/factory';
import { AppEvent } from './event';
import { AppEventType } from './event-type';

export class Bridge {
  private _connection: Connection;

  constructor(connection: Connection) {
    this._connection = connection;

    EventDispatcher.register(SignalingEventType.CONNECT, this.onConnect.bind(this));
    EventDispatcher.register(SignalingEventType.DISCONNECT, this.onDisconnect.bind(this));
    EventDispatcher.register(SignalingEventType.OFFER, this.onOffer.bind(this));
    EventDispatcher.register(SignalingEventType.ANSWER, this.onAnswer.bind(this));
    EventDispatcher.register(SignalingEventType.CANDIDATE, this.onCandidate.bind(this));
  }

  get connection(): Connection {
    return this._connection;
  }

  set connection(value: Connection) {
    this._connection = value;
  }

  onConnect(event: SignalingEvent) {
    const peer = PeerFactory.get(this._connection.servers, event);
    const channel = DataChannelFactory.get(peer, this._connection.dataConstraints);

    this.dispatchPeer(peer, event);
    this.dispatchChannel(channel, event);

    this._connection.addChannel(event.caller.id, channel);
    this._connection.addPeer(event.caller.id, peer);

    peer.createOffer(
      (desc: RTCSessionDescription) => {
        const message: SignalingEvent = {
          type: SignalingEventType.OFFER,
          caller: null,
          callee: event.caller,
          room: event.room,
          data: desc,
        };

        peer.setLocalDescription(desc, () => this.dispatchEvent(message),
          (evnt: DOMException) => this.dispatchError(event, evnt));
      },
      (evnt: DOMException) => this.dispatchError(event, evnt),
    );
  }

  onDisconnect(event: SignalingEvent) {
    this._connection.removeChannel(event.caller.id);
    this._connection.removePeer(event.caller.id);
  }

  onOffer(event: SignalingEvent) {
    const peer = PeerFactory.get(this._connection.servers, event);
    this._connection.addPeer(event.caller.id, peer);

    this.dispatchPeer(peer, event);

    peer.ondatachannel = (dataChannelEvent: RTCDataChannelEvent) => {
      this.dispatchChannel(dataChannelEvent.channel, event);
      this._connection.addChannel(event.caller.id, dataChannelEvent.channel);
    };

    peer.setRemoteDescription(new RTCSessionDescription(event.data), () => { },
      (evnt: DOMException) => this.dispatchError(event, evnt));

    peer.createAnswer(
      (desc: RTCSessionDescription) => {
        const message: SignalingEvent = {
          type: SignalingEventType.ANSWER,
          caller: null,
          callee: event.caller,
          room: event.room,
          data: desc,
        };

        peer.setLocalDescription(desc, () => this.dispatchEvent(message),
          (evnt: DOMException) => this.dispatchError(event, evnt));
      },
      (evnt: DOMException) => this.dispatchError(event, evnt),
    );
  }

  onAnswer(event: SignalingEvent) {
    const peer = this._connection.getPeer(event.caller.id);
    peer.setRemoteDescription(new RTCSessionDescription(event.data), () => { },
      (evnt: DOMException) => this.dispatchError(event, evnt));
  }

  onCandidate(event: SignalingEvent) {
    const peer = this._connection.getPeer(event.caller.id);
    const candidate = new RTCIceCandidate(event.data);

    peer.addIceCandidate(candidate).then(
      () => { },
      (evnt: DOMException) => this.dispatchError(event, evnt),
    );
  }

  private dispatchPeer(peer: RTCPeerConnection, event: SignalingEvent) {
    const message: AppEvent = {
      caller: event.caller,
      room: event.room,
      data: peer,
    };
    EventDispatcher.dispatch(AppEventType.PEER, message);
  }

  private dispatchChannel(channel: RTCDataChannel, event: SignalingEvent) {
    const message: AppEvent = {
      caller: event.caller,
      room: event.room,
      data: channel,
    };
    EventDispatcher.dispatch(AppEventType.CHANNEL, message);
  }

  private dispatchEvent(event: SignalingEvent) {
    EventDispatcher.dispatch('send', event);
  }

  private dispatchError(sEvent: SignalingEvent, event: DOMException) {
    const message: AppEvent = {
      caller: sEvent.caller,
      room: sEvent.room,
      data: event.message,
    };
    EventDispatcher.dispatch(AppEventType.ERROR, message);
  }
}
