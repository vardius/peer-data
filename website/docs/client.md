---
id: client
title: Basic Example
sidebar_label: Basic Example
---

## [WebRTC (Web Real-Time Communications)](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

WebRTC is designed to work peer-to-peer, so users can connect by the most direct route possible. However, WebRTC is built to cope with real-world networking: client applications need to traverse NAT gateways and firewalls, and peer to peer networking needs fallbacks in case direct connection fails. As part of this process, the WebRTC APIs use STUN servers to get the IP address of your computer, and TURN servers to function as relay servers in case peer-to-peer communication fails. (WebRTC in the real world explains in more detail.)

## Example

```typescript
import PeerData, { EventDispatcher, SocketChannel } from 'peer-data';

const servers = {
  iceServers: [
    {urls: "stun:stun.1.google.com:19302"}
  ]
};

const dispatcher = new EventDispatcher();
const peerData = new PeerData(dispatcher, servers);
const signaling = new SocketChannel(dispatcher, 'http://localhost:8080');

const room = peerData.connect('test-room');

// returns participant object
room.on("participant", participant => {
    //this peer disconnected from room
    participant.on("disconnected", () => console.log("disconnected"));

    //close connection, will dispatch disconnected event
    participant.close();
});

//exit room, will disconnect from all peers
room.disconnect();
```
