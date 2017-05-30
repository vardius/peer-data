# PeerData
[![Build Status](https://travis-ci.org/vardius/peer-data.svg?branch=master)](https://travis-ci.org/Vardius/peer-data)
[![codecov](https://codecov.io/gh/vardius/peer-data/branch/master/graph/badge.svg)](https://codecov.io/gh/vardius/peer-data)
[![npm version](https://img.shields.io/npm/v/peer-data.svg)](https://www.npmjs.com/package/peer-data)
[![npm downloads](https://img.shields.io/npm/dm/peer-data.svg)](https://www.npmjs.com/package/peer-data)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)
[![Beerpay](https://beerpay.io/vardius/peer-data/badge.svg?style=beer-square)](https://beerpay.io/vardius/peer-data)  [![Beerpay](https://beerpay.io/vardius/peer-data/make-wish.svg?style=flat-square)](https://beerpay.io/vardius/peer-data?focus=wish)

PeerData is a library for bidirectional peer-to-peer transfers of arbitrary data using [RTCDataChannel](https://developer.mozilla.org/pl/docs/Web/API/RTCDataChannel). Simple *WebRTC* wrapper providing data channel abstraction.

[WebRTC](https://webrtc.org/) needs a messaging service to set up and maintain a *WebRTC* call.

The sender and receiver *RTCPeerConnections* run in web pages on different devices, and we need a way for them to communicate metadata.
For this, we use a signaling server: a server that can pass messages between *WebRTC* clients (peers).

[PeerDataServer](https://github.com/Vardius/peer-data-server) - An **ready to use** example of signaling server on *Node* using [socket.io](http://socket.io/).

## Installation
```bash
$ npm install peer-data
```

## [Documentation](https://github.com/vardius/peer-data/wiki)

- [Chat Example](https://github.com/vardius/webrtc-chat)

ABOUT
==================================================
Contributors:

* [Rafał Lorenz](http://rafallorenz.com)

Want to contribute ? Feel free to send pull requests!

Have problems, bugs, feature ideas?
We are using the github [issue tracker](https://github.com/vardius/peer-data/issues) to manage them.

## License

The code is available under the [MIT license](LICENSE).
