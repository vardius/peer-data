/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {Signaling} from "../signaling/signaling";
import {SignalingEvent} from "../signaling/event";
import {SignalingEventType} from "../signaling/event-type";

export class PeerFactory {
    static get(servers: RTCConfiguration,
               signaling: Signaling): RTCPeerConnection {
        let peer = new RTCPeerConnection(servers);

        peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            let message: SignalingEvent = {
                type: SignalingEventType.CANDIDATE,
                caller: null,
                callee: null,
                data: event
            };
            signaling.send(message);
        };

        return peer;
    }
}
