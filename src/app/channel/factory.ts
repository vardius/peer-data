export class DataChannelFactory {
  public static get(peer: RTCPeerConnection, dataConstraints: RTCDataChannelInit): RTCDataChannel {
    const label = Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);

    const channel = peer.createDataChannel(label, dataConstraints);

    return channel;
  }
}
