/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {SignalingEvent} from './signaling/event';
import {SignalingEventType} from './signaling/event-type';
import {PeerFactory} from './peer/factory';
import {DataChannelFactory} from './data-channel/factory';
import {Signaling} from './signaling/signaling';
import {Connection} from './connection/connection';
import {EventDispatcher} from './data-channel/dispatcher';
import {EventType} from './data-channel/event-type';

const LABEL = 'chunks';

export class Bridge {
  private _connection: Connection;

  constructor(connection: Connection) {
    this._connection = connection;
  }

  onConnect(event: SignalingEvent, signaling: Signaling) {
    let peer = this._connection.peers[event.caller.id] = PeerFactory.get(this._connection.servers, signaling);
    let channel = peer.createDataChannel(LABEL, this._connection.dataConstraints);
    this._connection.channels[event.caller.id] = DataChannelFactory.get(channel);
    peer.createOffer((desc: RTCSessionDescription) => {
      let message: SignalingEvent = {
        type: SignalingEventType.OFFER,
        caller: null,
        callee: event.caller,
        data: desc
      };
      peer.setLocalDescription(desc, () => signaling.send(message), this.dispatchError);
    }, this.dispatchError);
  }

  onCandidate(event: SignalingEvent) {
    if (event.data) {
      let peer = this._connection.peers[event.caller.id];
      peer.addIceCandidate(new RTCIceCandidate(event.data));
    }
  }

  onOffer(event: SignalingEvent, signaling: Signaling) {
    let peer = this._connection.peers[event.caller.id] = PeerFactory.get(this._connection.servers, signaling);
    peer.ondatachannel = (dataChannelEvent: RTCDataChannelEvent) => {
      this._connection.addChannel(event.caller.id, DataChannelFactory.get(dataChannelEvent.channel));
    };
    peer.setRemoteDescription(new RTCSessionDescription(event.data), () => {
    }, this.dispatchError);
    peer.createAnswer((desc: RTCSessionDescription) => {
      let message: SignalingEvent = {
        type: SignalingEventType.ANSWER,
        caller: null,
        callee: event.caller,
        data: desc
      };
      peer.setLocalDescription(desc, () => signaling.send(message), this.dispatchError);
    }, this.dispatchError);
  }

  onAnswer(event: SignalingEvent) {
    let peer = this._connection.peers[event.caller.id];
    peer.setRemoteDescription(new RTCSessionDescription(event.data), () => {
    }, this.dispatchError);
  }

  onDisconnect(event: SignalingEvent) {
    let channel = this._connection.channels[event.caller.id];
    channel.close();
    let peer = this._connection.peers[event.caller.id];
    peer.close();
  }

  get connection(): Connection {
    return this._connection;
  }

  set connection(value: Connection) {
    this._connection = value;
  }

  private dispatchError(event: DOMException) {
    EventDispatcher.dispatch(EventType.ERROR, event);
  }
}
