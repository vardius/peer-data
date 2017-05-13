/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Signaling } from '../signaling/signaling';
export declare class PeerFactory {
    static get(servers: RTCConfiguration, signaling: Signaling): RTCPeerConnection;
}
