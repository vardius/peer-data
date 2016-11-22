/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {config} from "./config";
import {connection} from "./connection";
import {signaling} from "./signaling";
import DataChannelFactory from "./channel";
import {ICaller, IMessage} from "./bridge";

export interface IPeerCollection {
    [index: string]: RTCPeerConnection;
}

export default class PeerFactory {
    static get(caller: ICaller): RTCPeerConnection {
        let peer = new RTCPeerConnection(config.servers);

        peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                let message: IMessage = {
                    type: 'candidate',
                    caller: caller,
                    data: event.candidate
                };
                signaling.send(message);
            }
        };

        peer.ondatachannel = (event: RTCDataChannelEvent) => {
            connection.addChannel(caller.id, DataChannelFactory.get(event.channel));
        };

        return peer;
    }
}
