/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {connection} from "./connection";
import {signaling} from "./signaling";
import PeerFactory from "./peer";
import Logger from "./logger";
import DataChannelFactory from "./dataChannel";

export interface ICaller {
    id: string;
}

export default class Bridge {
    static onConnect(caller: ICaller) {
        let peer = connection.peers[caller.id] = PeerFactory.get(caller.id);
        let channel = peer.createDataChannel('sendDataChannel', {reliable: false});
        connection.channels[caller.id] = DataChannelFactory.get(channel);
        peer.createOffer((desc: RTCSessionDescription) => {
            peer.setLocalDescription(desc, () => signaling.send(peer.localDescription), Logger.log);
        }, Logger.log);
    }

    static onCandidate(caller: ICaller, candidate: RTCIceCandidate) {
        let peer = connection.peers[caller.id];
        peer.addIceCandidate(new RTCIceCandidate(candidate));
    }

    static onOffer(caller: ICaller, desc: RTCSessionDescription | RTCSessionDescriptionInit) {
        let peer = connection.peers[caller.id] = PeerFactory.get(caller.id);
        peer.setRemoteDescription(new RTCSessionDescription(desc), () => {
        }, Logger.log);
        peer.createAnswer((desc: RTCSessionDescription) => {
            peer.setLocalDescription(desc, () => signaling.send(peer.localDescription), Logger.log);
        }, Logger.log);
    }

    static onAnswer(caller: ICaller, desc: RTCSessionDescription | RTCSessionDescriptionInit) {
        let peer = connection.peers[caller.id];
        peer.setRemoteDescription(new RTCSessionDescription(desc), () => {
        }, Logger.log);
    }

    static onDisconnect(caller: ICaller) {
        let channel = connection.channels[caller.id];
        channel.close();
        let peer = connection.peers[caller.id];
        peer.close();
    }
}