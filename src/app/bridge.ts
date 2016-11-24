/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {CONFIG} from "./app";

export class Bridge {
    static onConnect(event: Connection.ConnectionEvent) {
        let peer = CONFIG.connection.peers[event.caller.id] = Peer.PeerFactory.get(event.caller, CONFIG.servers, CONFIG.signalling, CONFIG.connection);
        let channel = peer.createDataChannel('chunks');
        CONFIG.connection.channels[event.caller.id] = DataChannel.DataChannelFactory.get(channel);
        peer.createOffer((desc: RTCSessionDescription) => {
            let event: Signaling.SignalingEvent = {
                type: Signaling.EventType.OFFER,
                caller: null,
                callee: event.caller,
                data: peer.localDescription
            };
            peer.setLocalDescription(desc, () => CONFIG.signalling.send(event), CONFIG.logger.error);
        }, CONFIG.logger.error);
    }

    static onCandidate(event: Connection.ConnectionEvent) {
        let peer = CONFIG.connection.peers[event.caller.id];
        peer.addIceCandidate(new RTCIceCandidate(event.data));
    }

    static onOffer(event: Connection.ConnectionEvent) {
        let peer = CONFIG.connection.peers[event.caller.id] = Peer.PeerFactory.get(event.caller, CONFIG.servers, CONFIG.signalling, CONFIG.connection);
        peer.setRemoteDescription(new RTCSessionDescription(event.data), () => {
        }, CONFIG.logger.error);
        peer.createAnswer((desc: RTCSessionDescription) => {
            let event: Signaling.SignalingEvent = {
                type: Signaling.EventType.ANSWER,
                caller: null,
                callee: event.caller,
                data: peer.localDescription
            };
            peer.setLocalDescription(desc, () => CONFIG.signalling.send(event), CONFIG.logger.error);
        }, CONFIG.logger.error);
    }

    static onAnswer(event: Connection.ConnectionEvent) {
        let peer = CONFIG.connection.peers[event.caller.id];
        peer.setRemoteDescription(new RTCSessionDescription(event.data), () => {
        }, CONFIG.logger.error);
    }

    static onDisconnect(event: Connection.ConnectionEvent) {
        let channel = CONFIG.connection.channels[event.caller.id];
        channel.close();
        let peer = CONFIG.connection.peers[event.caller.id];
        peer.close();
    }
}
