export declare class Configuration {
    static getInstance(): Configuration;
    private static instance;
    private servers;
    private dataConstraints;
    private constructor();
    setServers(servers: RTCConfiguration): void;
    getServers(): RTCConfiguration;
    setDataConstraints(dataConstraints: RTCDataChannelInit): void;
    getDataConstraints(): RTCDataChannelInit;
}
