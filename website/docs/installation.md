---
id: installation
title: Getting Started
sidebar_label: Installation
---

*_PeerData_* is a library for bidirectional peer-to-peer transfers of arbitrary data using [RTCDataChannel](https://developer.mozilla.org/pl/docs/Web/API/RTCDataChannel). Simple *WebRTC* wrapper providing data channel abstraction.

[WebRTC](https://webrtc.org/) needs a messaging service to set up and maintain a *WebRTC* call.

The sender and receiver *RTCPeerConnections* run in web pages on different devices, and we need a way for them to communicate metadata.
For this, we use a signaling server: a server that can pass messages between *WebRTC* clients (peers).

[PeerDataServer](https://github.com/vardius/peer-data-server) - An **ready to use** example of signaling server on *Node* using [socket.io](http://socket.io/).

## Installation

<!--DOCUSAURUS_CODE_TABS-->
<!--npm-->
```yarn
npm install peer-data
```
<!--yarn-->
```bash
yarn add peer-data
```
<!--END_DOCUSAURUS_CODE_TABS-->

[WebRTC Chat](https://github.com/vardius/webrtc-chat) server-less example application.

[Shared versus Many `RCTPeerConnection`](https://bloggeek.me/webrtc-rtcpeerconnection-one-per-stream/)

*_PeerData_* runs multiple `RCTPeerConnection` - one per user. Why? Main reason because it is easier to manage participants. With multiple `RTCPeerConnection` we’ve got a lot more flexibility, since the sessions are independent – each encapsulated in its own `RTCPeerConnection`.
