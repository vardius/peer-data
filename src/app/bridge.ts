/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {CONFIG} from "./app";
import {ConnectionEvent} from "./connection/event";
import {SignalingEvent} from "./signaling/event";
import {SignalingEventType} from "./signaling/event-type";
import {PeerFactory} from "./peer/factory";
import {DataChannelFactory} from "./data-channel/factory";

export class Bridge {
    static onConnect(event: ConnectionEvent) {
        let peer = CONFIG.connection.peers[event.caller.id] = PeerFactory.get(CONFIG.servers, CONFIG.signalling);
        let channel = peer.createDataChannel('chunks', CONFIG.dataConstraints);
        CONFIG.connection.channels[event.caller.id] = DataChannelFactory.get(channel);
        peer.createOffer((desc: RTCSessionDescription) => {
            let message: SignalingEvent = {
                type: SignalingEventType.OFFER,
                caller: null,
                callee: event.caller,
                data: desc
            };
            peer.setLocalDescription(desc, () => CONFIG.signalling.send(message), CONFIG.logger.error.bind(CONFIG.logger));
        }, CONFIG.logger.error.bind(CONFIG.logger));
    }

    static onCandidate(event: ConnectionEvent) {
        let peer = CONFIG.connection.peers[event.caller.id];
        peer.addIceCandidate(new RTCIceCandidate(event.data));
    }

    static onOffer(event: ConnectionEvent) {
        let peer = CONFIG.connection.peers[event.caller.id] = PeerFactory.get(CONFIG.servers, CONFIG.signalling);
        peer.ondatachannel = (dataChannelEvent: RTCDataChannelEvent) => {
            CONFIG.connection.addChannel(event.caller.id, DataChannelFactory.get(dataChannelEvent.channel));
        };
        peer.setRemoteDescription(new RTCSessionDescription(event.data), () => {
        }, CONFIG.logger.error.bind(CONFIG.logger));
        peer.createAnswer((desc: RTCSessionDescription) => {
            let message: SignalingEvent = {
                type: SignalingEventType.ANSWER,
                caller: null,
                callee: event.caller,
                data: desc
            };
            peer.setLocalDescription(desc, () => CONFIG.signalling.send(message), CONFIG.logger.error.bind(CONFIG.logger));
        }, CONFIG.logger.error.bind(CONFIG.logger));
    }

    static onAnswer(event: ConnectionEvent) {
        let peer = CONFIG.connection.peers[event.caller.id];
        peer.setRemoteDescription(new RTCSessionDescription(event.data), () => {
        }, CONFIG.logger.error.bind(CONFIG.logger));
    }

    static onDisconnect(event: ConnectionEvent) {
        let channel = CONFIG.connection.channels[event.caller.id];
        channel.close();
        let peer = CONFIG.connection.peers[event.caller.id];
        peer.close();
    }
}
