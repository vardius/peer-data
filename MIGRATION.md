# Migrating from v3 to v4

v4 keeps rooms, participants and their events, and the messages peers exchange through the signaling server.
The `EventDispatcher` is gone: PeerData takes the signaling directly, SocketChannel takes a socket you create,
and connections negotiate by themselves. Behaviour that changed is listed at the end.

## 1. Install

```sh
npm install peer-data@4
```

peer-data no longer depends on socket.io-client. If you signal over socket.io, install the client that matches
your server (see [Signaling servers](#5-signaling-servers)):

```sh
npm install socket.io-client
```

v4 is an ES module only. Bundlers (Vite, webpack, esbuild, Rollup) and browsers load it as it is; there is no
CommonJS or UMD build any more. The types need TypeScript 5.7 or newer, with `moduleResolution` set to
`bundler`, `node16` or `nodenext`.

## 2. Before and after

```ts
// v3
import PeerData, { EventDispatcher, SocketChannel } from 'peer-data';

const dispatcher = new EventDispatcher();
const peerData = new PeerData(dispatcher, servers, constraints);
const signaling = new SocketChannel(dispatcher, 'http://localhost:8080');
```

```ts
// v4
import { io } from 'socket.io-client';
import { PeerData, SocketChannel } from 'peer-data';

const peerData = new PeerData(new SocketChannel(io('http://localhost:8080')), {
  configuration: servers,
  channel: constraints,
});
```

Joining a room and handling participants is the same:

```ts
const room = peerData.connect('test-room');

room.on('participant', (participant) => {
  participant.on('message', (payload) => console.log('message', payload));
  participant.send('Hi mate! this is private message.');
});
```

## 3. Every call

| v3                                                                                                    | v4                                                                               |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `import PeerData from 'peer-data'`                                                                    | `import { PeerData } from 'peer-data'`                                           |
| `import { Room, Participant } from 'peer-data'`, as classes                                           | types only: `import type { Room, Participant }`; `instanceof` no longer works    |
| `new PeerData(dispatcher, servers, dataConstraints)`                                                  | `new PeerData(signaling, { configuration: servers, channel: dataConstraints })`  |
| `new EventDispatcher()`                                                                               | gone: pass the signaling to `PeerData`                                           |
| `new SocketChannel(dispatcher, opts)`                                                                 | `new SocketChannel(io(url, opts))`                                               |
| `peerData.getEventDispatcher()`, `peerData.getConfiguration()`                                        | gone                                                                             |
| —                                                                                                     | `peerData.close()` leaves every room and stops listening to signaling            |
| `room.getId()`                                                                                        | `room.id`                                                                        |
| `room.getParticipantId()`, `room.getEventDispatcher()`, `room.getConfiguration()`, `room.getStream()` | gone                                                                             |
| —                                                                                                     | `room.participants`: the other peers in the room, by id                          |
| `participant.getId()`                                                                                 | `participant.id`                                                                 |
| `participant.renegotiate()`                                                                           | gone: the connection renegotiates by itself                                      |
| —                                                                                                     | `participant.connection`: its `RTCPeerConnection`, for `getStats` and the like   |
| —                                                                                                     | `participant.channel`: its data channel, for `bufferedAmount` when sending a lot |
| —                                                                                                     | the `connectTimeout` option: how long a participant's channel has to open        |
| `room.onSignalingEvent(event)`, `participant.onSignalingEvent(event)`                                 | gone: PeerData routes events                                                     |
| `.on(type, listener)`                                                                                 | the same, still chainable; event names and values are typed                      |
| —                                                                                                     | `.off(type, listener)`                                                           |
| —                                                                                                     | participant `connected` event: the data channel opened                           |
| `SignalingEventType.ERROR`                                                                            | gone: no one sent it                                                             |
| `SignalingEventType.OFFER` as a type                                                                  | `'OFFER'`: `SignalingEventType` is an object and a union type, not an enum       |

`room.on`, `room.send`, `room.disconnect`, `participant.on`, `participant.send`, `participant.addStream` and
`participant.close` keep their names. `room.disconnect()` and `participant.close()` return nothing, so they no
longer chain.

## 4. Custom signaling

In v3, a custom channel listened for `send` on the dispatcher and dispatched what arrived by its type.
In v4 it is an object with two methods:

```ts
// v3
dispatcher.register('send', (event) => socket.emit('message', event));
socket.on('message', (event) => dispatcher.dispatch(event.type, event));
```

```ts
// v4
import { PeerData, type Signaling } from 'peer-data';

const signaling: Signaling = {
  send: (event) => socket.emit('message', event),
  subscribe: (listener) => {
    socket.on('message', listener);
    return () => socket.off('message', listener);
  },
};

const peerData = new PeerData(signaling);
```

PeerData checks every message it receives and ignores anything that is not a signaling event, so `subscribe`
can pass messages on as they come.

`BroadcastChannelSignaling` is new: it signals between tabs of the same origin with no server, for demos and
tests.

## 5. Signaling servers

The messages peers exchange keep their v3 shape: `type`, `room`, `caller`, `callee` and `payload`, with
CONNECT and DISCONNECT broadcast to the room and the rest sent to the callee. A server that routed v3 peers
routes v4 peers.

What changes is the socket.io version, which is now yours to choose. socket.io clients and servers only talk
within compatible versions:

- **socket.io 3 or 4 server**: use socket.io-client 4.
- **socket.io 2 server**, such as [peer-data-server](https://github.com/vardius/peer-data-server) 1.x:
  use socket.io-client 2 (`npm install socket.io-client@2`), or move the server to socket.io 4.

[examples/socket/server.ts](https://github.com/vardius/peer-data/blob/master/examples/socket/server.ts) is a signaling server on socket.io 4 that also checks
each socket only speaks for the ids it joined with.

## 6. Behaviour changes

- **Upgrade every peer together.** A v4 peer and a v3 peer in the same room set up their data channels
  differently and can't exchange data.
- **Peers without media connect.** In v3, peers that shared no stream never negotiated a connection, so their
  data never arrived. In v4 every participant gets a connection with a data channel, media or not.
- **Sends before the channel opens wait.** v3 dropped them silently, including a `send` in the `participant`
  listener. v4 queues them and sends them in order once the channel opens; `connected` fires after that.
- **`send` on a disconnected participant throws.** v3 dropped the data silently.
- **Binary data arrives as an `ArrayBuffer`**, in every browser. In v3 it depended on the browser's default,
  a `Blob` in some.
- **`send` refuses a `Blob`.** Browsers read a Blob before sending it, so it could arrive out of order. Send
  `await blob.arrayBuffer()`.
- **Data queued before the channel opens is copied**, so changing a buffer after sending it doesn't change what
  arrives.
- **Crossing offers are resolved.** In v3, peers that joined with a stream at the same moment sent each other
  offers at once and never connected. v4 uses the perfect negotiation pattern: one side yields, so both can join
  with media or add it at the same time and still connect.
- **`disconnected` fires once**: when the participant leaves, its connection fails, you call `close()`, or the
  data channel closes. v3 fired it for each closed or failed state, and for the transient `disconnected` state,
  which can recover by itself.
- **A disconnected participant leaves `room.participants`**, and a later CONNECT from the same id creates a
  new participant. A CONNECT from an id that still has a participant replaces it.
- **A participant whose channel doesn't open in 30 seconds is closed**, as for a peer that never answers.
  `connectTimeout` changes how long.
- **Errors go where they belong.** A participant's `error` event reports its failed negotiation; the room's
  `error` event reports a participant that could not be set up, such as with an invalid `RTCConfiguration`.
  An error with no listener is reported as uncaught instead of being lost.
- **`connect` checks its input.** An empty room id throws a `TypeError`; connecting after `peerData.close()`
  throws.
- **No webrtc-adapter.** Current browsers implement the standard API that v4 uses.
- **SocketChannel only forwards `message`.** v3 also turned the server's `ipaddr` and `log` events into `log`
  dispatches; listen on your socket for anything else your server sends.
- **SocketChannel rejoins after a reconnect.** When the socket reconnects, it announces this peer again in every
  room it's in, so it meets the peers that join after.
