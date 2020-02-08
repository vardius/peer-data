---
id: data-channel
title: Data Channel
sidebar_label: Data Channel
---

## [What is a data channel?](https://developer.mozilla.org/en-US/docs/Games/Techniques/WebRTC_data_channels#What_is_a_data_channel)

A WebRTC data channel lets you send text or binary data over an active connection to a peer. In the context of a game, this lets players send data to each other, whether text chat or game status information. Data channels come in two flavors.

## Example:
```typescript
import PeerData from 'peer-data';

const servers = {
  iceServers: [
    {url: "stun:stun.1.google.com:19302"}
  ]
};

const constraints = {ordered: true};
const peerData = new PeerData(servers, constraints);
const room = peerData.connect('test-room');

//payload object can be everything
const payload = {msg: "Hi there!", date: now()};
//send to everybody in room
room.send(payload);

room.on("participant", participant => {
    //this peer sent a message
    participant.on("message", payload => console.log("message", payload));

    //send only to participant
    participant.send('Hi mate! this is private message.');
});
```
