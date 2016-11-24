# PeerData
[![Build Status](https://travis-ci.org/Vardius/peer-data.svg?branch=master)](https://travis-ci.org/Vardius/peer-data)

[WebRTC](https://webrtc.org/) needs a messaging service to set up and maintain a *WebRTC* call.

The sender and receiver *RTCPeerConnections* run in web pages on different devices, and we need a way for them to communicate metadata.
For this, we use a signaling server: a server that can pass messages between *WebRTC* clients (peers).

[PeerDataServer](https://github.com/Vardius/peer-data-server) - An **ready to use** example of signaling server on *Node* using [socket.io](http://socket.io/).

## Installation
```bash
$ npm install peer-data
```
## Usage
[**Docs**](doc)
- [Usage](doc/usage.md)
