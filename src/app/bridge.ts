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
import {Logger} from './logger/logger';
import {Signaling} from './signaling/signaling';
import {Connection} from './connection/connection';

const LABEL = 'chunks';

export class Bridge {
  private _connection: Connection;
  private _logger: Logger;

  constructor(connection: Connection, logger: Logger) {
    this._connection = connection;
    this._logger = logger;
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
      peer.setLocalDescription(desc, () => signaling.send(message), this._logger.error.bind(this._logger));
    }, this._logger.error.bind(this._logger));
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
    }, this._logger.error.bind(this._logger));
    peer.createAnswer((desc: RTCSessionDescription) => {
      let message: SignalingEvent = {
        type: SignalingEventType.ANSWER,
        caller: null,
        callee: event.caller,
        data: desc
      };
      peer.setLocalDescription(desc, () => signaling.send(message), this._logger.error.bind(this._logger));
    }, this._logger.error.bind(this._logger));
  }

  onAnswer(event: SignalingEvent) {
    let peer = this._connection.peers[event.caller.id];
    peer.setRemoteDescription(new RTCSessionDescription(event.data), () => {
    }, this._logger.error.bind(this._logger));
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

  get logger(): Logger {
    return this._logger;
  }

  set logger(value: Logger) {
    this._logger = value;
  }
}
