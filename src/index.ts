/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {App} from "./app/app";

const PeerData = new App();

export default PeerData;

export {Connection} from './app/connection/connection';
export {Signaling} from './app/signaling/signaling';
export {Logger} from './app/logger/logger';
export {LogLevel} from './app/logger/log-level';
export {SignalingEvent} from './app/signaling/event';
export {SignalingEventType} from './app/signaling/event-type';
export {EventType} from './app/data-channel/event-type';
