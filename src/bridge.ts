/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {CONFIG} from "./app";
import {PeerFactory} from "./peer";
import {DataChannelFactory} from "./channel";

export interface IMessage {
    type: string;
    caller: ICaller;
    data: any;
}

export interface ICaller {
    id: string;
}

export class Bridge {
    static onConnect(caller: ICaller) {
        let peer = CONFIG.connection.peers[caller.id] = PeerFactory.get(caller);
        let channel = peer.createDataChannel('chunks');
        CONFIG.connection.channels[caller.id] = DataChannelFactory.get(channel);
        peer.createOffer((desc: RTCSessionDescription) => {
            let message: IMessage = {
                type: 'offer',
                caller: caller,
                data: peer.localDescription
            };
            peer.setLocalDescription(desc, () => CONFIG.signalling.send(message), CONFIG.logger.error);
        }, CONFIG.logger.error);
    }

    static onCandidate(caller: ICaller, candidate: RTCIceCandidate) {
        let peer = CONFIG.connection.peers[caller.id];
        peer.addIceCandidate(new RTCIceCandidate(candidate));
    }

    static onOffer(caller: ICaller, desc: RTCSessionDescriptionInit) {
        let peer = CONFIG.connection.peers[caller.id] = PeerFactory.get(caller);
        peer.setRemoteDescription(new RTCSessionDescription(desc), () => {
        }, CONFIG.logger.error);
        peer.createAnswer((desc: RTCSessionDescription) => {
            let message: IMessage = {
                type: 'answer',
                caller: caller,
                data: peer.localDescription
            };
            peer.setLocalDescription(desc, () => CONFIG.signalling.send(message), CONFIG.logger.error);
        }, CONFIG.logger.error);
    }

    static onAnswer(caller: ICaller, desc: RTCSessionDescriptionInit) {
        let peer = CONFIG.connection.peers[caller.id];
        peer.setRemoteDescription(new RTCSessionDescription(desc), () => {
        }, CONFIG.logger.error);
    }

    static onDisconnect(caller: ICaller) {
        let channel = CONFIG.connection.channels[caller.id];
        channel.close();
        let peer = CONFIG.connection.peers[caller.id];
        peer.close();
    }
}