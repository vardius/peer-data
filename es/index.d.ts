/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { App as PeerData } from './app/app';
export default PeerData;
export { Event } from './app/signaling/event';
export { EventType } from './app/handler/event-type';
export { Signaling } from './app/signaling/signaling';
export { EventType as SignalingEventType } from './app/signaling/event-type';
export { SocketChannel } from './app/socket-channel';
