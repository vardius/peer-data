/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {configuration} from "./config";
import {connection} from "./connection";
import {signaling} from "./signaling";
import DataChannelFactory from "./dataChannel";

export interface IPeerCollection {
    [index: string]: RTCPeerConnection;
}

export default class PeerFactory {
    static get(id): RTCPeerConnection {
        let peer = new RTCPeerConnection(configuration.servers, configuration.constraint);
        peer.onicecandidate = this.onIceCandidate;
        peer.ondatachannel = (event: RTCDataChannelEvent) => {
            connection.addChannel(id, DataChannelFactory.get(event.channel));
        };

        return peer;
    }

    static onIceCandidate(event: RTCIceCandidateEvent) {
        if (event.candidate) {
            let message = {
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            };
            signaling.send(message);
        }
    }
}
