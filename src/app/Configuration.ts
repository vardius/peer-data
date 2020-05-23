export class Configuration {
    private servers: RTCConfiguration = {};
    private dataConstraints?: RTCDataChannelInit;

    setServers = (servers: RTCConfiguration): void => {
        this.servers = servers;
    };

    getServers = (): RTCConfiguration => this.servers;

    setDataConstraints = (dataConstraints: RTCDataChannelInit): void => {
        this.dataConstraints = dataConstraints;
    };

    getDataConstraints = (): RTCDataChannelInit | undefined => this.dataConstraints;
}
