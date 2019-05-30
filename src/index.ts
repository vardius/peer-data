/// <reference types="webrtc" />
import 'webrtc-adapter';

import { App as PeerData } from './app/App';

import { Room } from './app/Room';
import { Participant } from './app/Participant';
import { EventDispatcher } from './app/EventDispatcher';

import { Signaling, SignalingEvent, SignalingEventType } from './app/Signaling';
import { SocketChannel } from './app/SocketChannel';

export {
    Room,
    Participant,
    EventDispatcher,
    Signaling,
    SignalingEvent,
    SignalingEventType,
    SocketChannel,
};

export default PeerData;
