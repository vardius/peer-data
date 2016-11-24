/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Peer {
    export class PeerFactory {
        static get(caller: Signaling.Caller,
                   servers: RTCConfiguration,
                   signaling: Signaling.Signaling,
                   connection: Connection.Connection): RTCPeerConnection {
            let peer = new RTCPeerConnection(servers);

            peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
                if (event.candidate) {
                    let message: Signaling.SignalingEvent = {
                        type: Signaling.EventType.CANDIDATE,
                        caller: null,
                        callee: null,
                        data: event.candidate
                    };
                    signaling.send(message);
                }
            };

            peer.ondatachannel = (event: RTCDataChannelEvent) => {
                connection.addChannel(caller.id, DataChannel.DataChannelFactory.get(event.channel));
            };

            return peer;
        }
    }
}
