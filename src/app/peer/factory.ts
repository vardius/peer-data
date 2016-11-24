/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Caller} from "../signaling/caller";
import {Signaling} from "../signaling/signaling";
import {Connection} from "../connection/connection";
import {SignalingEvent} from "../signaling/event";
import {SignalingEventType} from "../signaling/event-type";
import {DataChannelFactory} from "../data-channel/factory";

export class PeerFactory {
    static get(caller: Caller,
               servers: RTCConfiguration,
               signaling: Signaling,
               connection: Connection): RTCPeerConnection {
        let peer = new RTCPeerConnection(servers);

        peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                let message: SignalingEvent = {
                    type: SignalingEventType.CANDIDATE,
                    caller: null,
                    callee: null,
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
