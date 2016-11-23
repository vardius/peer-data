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
    static onConnect(caller: Signaling.Caller) {
        let peer = CONFIG.connection.peers[caller.id] = Peer.PeerFactory.get(caller, CONFIG.servers, CONFIG.signalling, CONFIG.connection);
        let channel = peer.createDataChannel('chunks');
        CONFIG.connection.channels[caller.id] = DataChannel.DataChannelFactory.get(channel);
        peer.createOffer((desc: RTCSessionDescription) => {
            let event: Signaling.SignalingEvent = {
                type: 'offer',
                caller: caller,
                data: peer.localDescription
            };
            peer.setLocalDescription(desc, () => CONFIG.signalling.send(event), CONFIG.logger.error);
        }, CONFIG.logger.error);
    }

    static onCandidate(caller: Signaling.Caller, candidate: RTCIceCandidate) {
        let peer = CONFIG.connection.peers[caller.id];
        peer.addIceCandidate(new RTCIceCandidate(candidate));
    }

    static onOffer(caller: Signaling.Caller, desc: RTCSessionDescription | RTCSessionDescriptionInit) {
        let peer = CONFIG.connection.peers[caller.id] = Peer.PeerFactory.get(caller, CONFIG.servers, CONFIG.signalling, CONFIG.connection);
        peer.setRemoteDescription(new RTCSessionDescription(desc), () => {
        }, CONFIG.logger.error);
        peer.createAnswer((desc: RTCSessionDescription) => {
            let event: Signaling.SignalingEvent = {
                type: 'answer',
                caller: caller,
                data: peer.localDescription
            };
            peer.setLocalDescription(desc, () => CONFIG.signalling.send(event), CONFIG.logger.error);
        }, CONFIG.logger.error);
    }

    static onAnswer(caller: Signaling.Caller, desc: RTCSessionDescription | RTCSessionDescriptionInit) {
        let peer = CONFIG.connection.peers[caller.id];
        peer.setRemoteDescription(new RTCSessionDescription(desc), () => {
        }, CONFIG.logger.error);
    }

    static onDisconnect(caller: Signaling.Caller) {
        let channel = CONFIG.connection.channels[caller.id];
        channel.close();
        let peer = CONFIG.connection.peers[caller.id];
        peer.close();
    }
}
