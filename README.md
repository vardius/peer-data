# 📡 peer-data

[![CI](https://github.com/vardius/peer-data/actions/workflows/ci.yml/badge.svg)](https://github.com/vardius/peer-data/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/peer-data.svg)](https://www.npmjs.com/package/peer-data)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

WebRTC rooms for the browser: send data and share media straight from one peer to the others.

- **Rooms.** Join a room by name, and get a participant for every other peer in it, each with its own `RTCPeerConnection`.
- **Data channels.** `send` a string or binary data to one participant or the whole room. Messages sent before the channel opens wait and go out in order.
- **Media.** Share a `MediaStream` when you join or at any time later: the connection renegotiates by itself, and offers that cross are resolved with the perfect negotiation pattern.
- **Your signaling.** socket.io with the client version that matches your server, `BroadcastChannel` between tabs with no server at all, or your own in two methods.
- **Small.** No dependencies, typed events, ES modules, written in strict TypeScript.

📖 **[Documentation](https://vardius.github.io/peer-data/)** · [Live demo](https://vardius.github.io/peer-data/demo/) · [Examples](examples) · [Migrating from v3](MIGRATION.md)

## Install

```sh
npm install peer-data
```

peer-data runs in current Chrome, Edge, Firefox and Safari; its tests run in Chromium, Firefox and WebKit.

## Quick start

Two tabs of the same page talk with no server, through `BroadcastChannel`:

```ts
import { BroadcastChannelSignaling, PeerData } from 'peer-data';

const peer = new PeerData(new BroadcastChannelSignaling());
const room = peer.connect('lobby');

room.on('participant', (participant) => {
  participant.on('message', (data) => console.log(participant.id, 'says', data));
  participant.send('hello');
});
```

Open it in two tabs, and each logs the other's hello. Across browsers and devices, signal through a server instead:

```ts
import { io } from 'socket.io-client';
import { PeerData, SocketChannel } from 'peer-data';

const peer = new PeerData(new SocketChannel(io('https://signaling.example.com')), {
  configuration: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
});
```

[examples/socket/server.ts](examples/socket/server.ts) is a small signaling server on socket.io 4 to start from.

## Media

Pass a stream when you join, and every participant receives its tracks:

```ts
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
const room = peer.connect('call', stream);

room.on('participant', (participant) => {
  participant.on('track', ({ streams: [remote] }) => {
    if (remote) video.srcObject = remote;
  });
});
```

`participant.addStream(stream)` shares one later. Either side can add media at any time.

## Leaving

`room.disconnect()` tells the others and closes every connection in the room; `peer.close()` leaves every room.
A participant fires `disconnected` once when it leaves, its connection fails, or you call `participant.close()`.

## Upgrading from v3

v4 has no `EventDispatcher`: PeerData takes the signaling directly, and SocketChannel takes a socket you create.

```ts
// v3
const dispatcher = new EventDispatcher();
const peerData = new PeerData(dispatcher, servers, constraints);
const signaling = new SocketChannel(dispatcher, 'http://localhost:8080');

// v4
const peerData = new PeerData(new SocketChannel(io('http://localhost:8080')), {
  configuration: servers,
  channel: constraints,
});
```

The messages between peers keep their v3 shape, so v3 signaling servers still route them.
[MIGRATION.md](MIGRATION.md) maps every v3 call to its v4 form and lists the behaviour changes.

## Contributing

Bug reports and pull requests are welcome: see [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License

MIT, see [LICENSE](LICENSE).
