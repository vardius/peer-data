---
id: media-stream
title: Media Stream
sidebar_label: Media Stream
---

## [Media Capture and Streams Concepts and Usage](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API#Media_Capture_and_Streams_Concepts_and_Usage)

The Media Capture and Streams API, often called the Media Streams API or simply MediaStream API, is an API related to WebRTC which provides support for streaming audio and video data.
It provides the interfaces and methods for working with the streams and their constituent tracks, the constraints associated with data formats, the success and error callbacks when using the data asynchronously, and the events that are fired during the process.

## Example

```javascript
import PeerData from 'peer-data';

const servers = {
  iceServers: [
    {url: "stun:stun.1.google.com:19302"}
  ]
};

const peerData = new PeerData(servers);

// get video/voice stream
navigator.getUserMedia({ video: true, audio: true }, gotMedia, () => {})

function gotMedia (stream) {
    // passing stream is optional, if passed will be shared between all peers in current room
    const room = peerData.connect('test-room', stream);

    room.on("participant", participant => {
        //this peer shared a stream
        participant.on("track", event => {
          const stream = event.streams[0];
          console.log("track", event, stream);
        });
    });
}
```

## Add stream to existing connection
```javascript
import PeerData from 'peer-data';

const servers = {
  iceServers: [
    {url: "stun:stun.1.google.com:19302"}
  ]
};

const peerData = new PeerData(servers);
const room = peerData.connect('test-room');

room.on("participant", participant => {
  navigator.mediaDevices
    .getUserMedia({video: true})
    .then(stream => {
      participant.addStream(stream);
      participant.renegotiate();
    });
});
```