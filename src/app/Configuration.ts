export class Configuration {
    private static instance: Configuration;
    private servers: RTCConfiguration = {};
    private dataConstraints?: RTCDataChannelInit;

    private constructor() { }
    static getInstance(): Configuration {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();
        }

        return Configuration.instance;
    }

    setServers = (servers: RTCConfiguration): void => {
        this.servers = servers;
    };

    getServers = (): RTCConfiguration => this.servers;

    setDataConstraints = (dataConstraints: RTCDataChannelInit): void => {
        this.dataConstraints = dataConstraints;
    };

    getDataConstraints = (): RTCDataChannelInit | undefined => this.dataConstraints;
}
