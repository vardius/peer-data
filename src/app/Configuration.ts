export class Configuration {
    static getInstance(): Configuration {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();
        }

        return Configuration.instance;
    }

    private static instance: Configuration;
    private servers: RTCConfiguration = {};
    private dataConstraints: RTCDataChannelInit = null;

    private constructor() { }

    setServers(servers: RTCConfiguration) {
        this.servers = servers;
    }

    getServers(): RTCConfiguration {
        return this.servers;
    }

    setDataConstraints(dataConstraints: RTCDataChannelInit) {
        this.dataConstraints = dataConstraints;
    }

    getDataConstraints(): RTCDataChannelInit {
        return this.dataConstraints;
    }
}
