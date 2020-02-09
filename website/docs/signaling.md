---
id: signaling
title: Signaling Server
sidebar_label: Signaling Server
---

## [The signaling server](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling#The_signaling_server)
Signaling is the process of coordinating communication. In order for a WebRTC application to set up a 'call', its clients need to exchange information:

- Session control messages used to open or close communication.
- Error messages.
- Key data, used to establish secure connections.
- Network data, such as a host's IP address and port as seen by the outside world.

`PeerData` needs signaling server to work. Before `connect` you need to set signaling server. You can use ready to go Socket Channel included in `peer-data` package.

```javascript
import PeerData, {SocketChannel} from 'peer-data';

let peerData = new PeerData();
let signaling = new SocketChannel('http://localhost:8080');

peerData.connect();
```

[PeerDataServer](https://github.com/vardius/peer-data-server) example of socket.io signaling server implementation for `SocketChannel`. 

If you want to create custom signaling channel, take a look what events does dispatch and subscribe to [SocketChannel.ts](https://github.com/vardius/peer-data/blob/master/src/app/SocketChannel.ts) and remember to do the same.

## Custom signaling channel

It's important to note that the server doesn't need to understand or interpret the signaling data content. Although it's SDP, even this doesn't matter so much: the content of the message going through the signaling server is, in effect, a black box. What does matter is when the ICE subsystem instructs you to send signaling data to the other peer, you do so, and the other peer knows how to receive this information and deliver it to its own ICE subsystem. All you have to do is channel the information back and forth. The contents don't matter at all to the signaling server.

When writing custom signaling channel you have to listen to all `send` events on `EventDispatcher`. And pass them on to the other clients in a room.

Check how is it done in the [SocketChannel](https://github.com/vardius/peer-data/blob/356008b0116a25ddac34a823ffac8ee1b07c72ec/src/app/SocketChannel.ts#L13) which passes all events to socket server.

```typescript
import { EventDispatcher } from 'peer-data';

EventDispatcher.getInstance().register('send',onSend);

onSend = (event: SignalingEvent) => {
 socket.emit('message', event); // @TODO: implement your own logic
}
```

Also channel has to listen to events passed from server and dispatch them to user's peer. This is done by [listening socket events](https://github.com/vardius/peer-data/blob/356008b0116a25ddac34a823ffac8ee1b07c72ec/src/app/SocketChannel.ts#L23) and passing them to the event dispatcher.

```typescript
import { EventDispatcher } from 'peer-data';

socket.on('message',onMessage); // @TODO: implement your own logic

onMessage = (event: SignalingEvent) => {
  EventDispatcher.getInstance().dispatch(event.type, event);
}
```

This way we simply send the candidates and descriptions, back and forth, through the signaling server.

https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling#Exchanging_ICE_candidates
