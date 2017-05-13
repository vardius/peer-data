import { Event } from './../connection/event';
export declare class PeerFactory {
    static get(servers: RTCConfiguration, event: Event): RTCPeerConnection;
}
