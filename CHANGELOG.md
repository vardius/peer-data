# Changelog

## v4.0.0 (2026-10-24)

A rewrite in strict TypeScript with no dependencies. See the [migration guide](https://vardius.github.io/peer-data/migrating-from-v3/) for
the before and after of every call.

### Added

- `BroadcastChannelSignaling`: signaling between tabs of the same origin, with no server.
- `peerData.close()` leaves every room and stops listening to signaling.
- `room.participants`, the other peers in the room by id, `participant.connection`, its `RTCPeerConnection`,
  and `participant.channel`, its data channel.
- The `connectTimeout` option: a participant whose data channel doesn't open in time, 30 seconds by default, is
  closed.
- `SocketChannel` announces this peer again in every room it's in when the socket reconnects.
- `off` on rooms and participants, and typed event names and values for `on` and `off`.
- A participant `connected` event, fired when its data channel opens.
- Runnable examples in `examples/`: a chat between tabs, a video call, a chat through a socket.io 4 signaling
  server, and sending more than a data channel buffers. The signaling server runs on Vite's dev and preview
  servers through a Vite plugin, which the new Vite guide shows.

### Changed

- `PeerData` is a named export, and takes the signaling and an options object:
  `new PeerData(signaling, { configuration, channel })`.
- `SocketChannel` takes a socket.io client socket you create, of the version that matches your server.
- A custom signaling channel implements `send` and `subscribe` instead of listening on an `EventDispatcher`.
- Getters became properties: `room.id`, `participant.id`.
- Connections negotiate with the perfect negotiation pattern: either side can add media at any time, and offers
  that cross are resolved.
- Each connection has one data channel that both sides create, so it exists from the start and renegotiation
  never replaces it. v3 and v4 peers can't exchange data in the same room.
- Data sent before the channel opens waits, copied, and goes out in order once it does.
- `send` on a disconnecting or disconnected participant throws, and `send` refuses a `Blob`, which could arrive
  out of order.
- `room.send` sends to every participant it can before throwing for one it can't.
- Binary data arrives as an `ArrayBuffer` in every browser.
- `disconnected` fires once per participant, and only for a closed or failed connection; a disconnected
  participant leaves `room.participants`.
- Negotiation errors go to the participant's `error` event, and errors with no listener are reported as
  uncaught.
- A CONNECT from an id that still has a participant replaces the participant.
- `connect` throws for an empty room id and after `close`.
- `Room` and `Participant` are exported as types only, `SignalingEventType` is an object and a union type
  instead of an enum, and `room.disconnect()` and `participant.close()` return nothing.
- ES module only, with types; no CommonJS or UMD build.

### Fixed

- Peers that shared no media never connected, so data between them never arrived.
- Data sent from the `participant` listener, before the channel opened, was dropped.
- Peers that joined with a stream at the same moment never connected: their offers crossed, and neither side
  recovered.

### Removed

- `EventDispatcher`, `participant.renegotiate()`, `onSignalingEvent`, and the `getEventDispatcher`,
  `getConfiguration`, `getParticipantId` and `getStream` getters.
- `SignalingEventType.ERROR`, and the `ipaddr` and `log` socket events.
- The socket.io-client and uuid dependencies, and the webrtc-adapter peer dependency, which v3 never imported.
