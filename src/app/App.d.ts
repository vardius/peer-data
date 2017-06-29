import { Room } from './Room';
export declare class App {
    private rooms;
    constructor(servers?: RTCConfiguration, dataConstraints?: RTCDataChannelInit);
    connect(id: string, stream?: MediaStream): Room;
    private onEvent(event);
    private onDisconnected(event);
}
