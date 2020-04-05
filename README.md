# PeerData
[![Build Status](https://travis-ci.org/vardius/peer-data.svg?branch=master)](https://travis-ci.org/vardius/peer-data)
[![npm version](https://img.shields.io/npm/v/peer-data.svg)](https://www.npmjs.com/package/peer-data)
[![npm downloads](https://img.shields.io/npm/dm/peer-data.svg)](https://www.npmjs.com/package/peer-data)
[![license](https://img.shields.io/github/license/vardius/peer-data.svg)](LICENSE)
<!--[![codecov](https://codecov.io/gh/vardius/peer-data/branch/master/graph/badge.svg)](https://codecov.io/gh/vardius/peer-data)-->

<img align="right" height="180px" src="website/src/static/img/logo.png" alt="logo" />

PeerData is a library for bidirectional peer-to-peer transfers of arbitrary data using [RTCDataChannel](https://developer.mozilla.org/pl/docs/Web/API/RTCDataChannel). Simple *WebRTC* wrapper providing data channel abstraction.

[WebRTC](https://webrtc.org/) needs a messaging service to set up and maintain a *WebRTC* call.

The sender and receiver *RTCPeerConnections* run in web pages on different devices, and we need a way for them to communicate metadata.
For this, we use a signaling server: a server that can pass messages between *WebRTC* clients (peers).

[PeerDataServer](https://github.com/vardius/peer-data-server) - An **ready to use** example of signaling server on *Node* using [socket.io](http://socket.io/).

📖 ABOUT
==================================================
Contributors:

* [Rafał Lorenz](https://rafallorenz.com)

Want to contribute ? Feel free to send pull requests!

Have problems, bugs, feature ideas?
We are using the github [issue tracker](https://github.com/vardius/peer-data/issues) to manage them.

## 📚 Documentation

For **documentation** (_including examples_), **visit [rafallorenz.com/peer-data](https://rafallorenz.com/peer-data)**

🚏 HOW TO USE
==================================================

2. [Chat Example](https://github.com/vardius/webrtc-chat)
3. [React Chat Example](https://github.com/vardius/react-webrtc-chat)
4. [React Hook](https://github.com/vardius/react-peer-data)

## Installation
```bash
$ npm install peer-data
```

## Basic example
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

room.on("participant", participant => {
  participant.on("message", payload => console.log("message", payload));

  participant.send('Hi mate! this is private message.');
})
```

For how to **disconnect**, **close connection** and handle errors please check [documentation](https://rafallorenz/peer-data/docs/client).

📜 [License](LICENSE.md)
-------

This package is released under the MIT license. See the complete license in the package:
