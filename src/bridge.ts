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
import DataChannelFactory from "./channel";

export interface IMessage {
    type: string;
    caller: ICaller;
    data: any;
}

export interface ICaller {
    id: string;
}

export default class Bridge {
    static onConnect(caller: ICaller) {
        let peer = connection.peers()[caller.id] = PeerFactory.get(caller);
        let channel = peer.createDataChannel('chunks');
        connection.channels()[caller.id] = DataChannelFactory.get(channel);
        peer.createOffer((desc: RTCSessionDescription) => {
            let message: IMessage = {
                type: 'offer',
                caller: caller,
                data: peer.localDescription
            };
            peer.setLocalDescription(desc, () => signaling.send(message), Logger.error);
        }, Logger.error);
    }

    static onCandidate(caller: ICaller, candidate: RTCIceCandidate) {
        let peer = connection.peers()[caller.id];
        peer.addIceCandidate(new RTCIceCandidate(candidate));
    }

    static onOffer(caller: ICaller, desc: RTCSessionDescriptionInit) {
        let peer = connection.peers()[caller.id] = PeerFactory.get(caller);
        peer.setRemoteDescription(new RTCSessionDescription(desc), () => {
        }, Logger.log);
        peer.createAnswer((desc: RTCSessionDescription) => {
            let message: IMessage = {
                type: 'answer',
                caller: caller,
                data: peer.localDescription
            };
            peer.setLocalDescription(desc, () => signaling.send(message), Logger.log);
        }, Logger.log);
    }

    static onAnswer(caller: ICaller, desc: RTCSessionDescriptionInit) {
        let peer = connection.peers()[caller.id];
        peer.setRemoteDescription(new RTCSessionDescription(desc), () => {
        }, Logger.log);
    }

    static onDisconnect(caller: ICaller) {
        let channel = connection.channels()[caller.id];
        channel.close();
        let peer = connection.peers()[caller.id];
        peer.close();
    }
}