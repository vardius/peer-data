export declare class DataChannelFactory {
    static get(channel: RTCDataChannel): RTCDataChannel;
    private static onMessage(event);
    private static onOpen(event);
    private static onClose(event);
    private static onError(event);
}
