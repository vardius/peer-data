/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {ICaller, IMessage} from "./bridge";
import {CONFIG} from "./app";
import {DataChannelFactory} from "./channel";

export interface IPeerCollection {
    [index: string]: RTCPeerConnection;
}

export class PeerFactory {
    static get(caller: ICaller): RTCPeerConnection {
        let peer = new RTCPeerConnection(CONFIG.servers);

        peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                let message: IMessage = {
                    type: 'candidate',
                    caller: caller,
                    data: event.candidate
                };
                CONFIG.signalling.send(message);
            }
        };

        peer.ondatachannel = (event: RTCDataChannelEvent) => {
            CONFIG.connection.addChannel(caller.id, DataChannelFactory.get(event.channel));
        };

        return peer;
    }
}
