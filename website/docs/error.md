---
id: error
title: Error Handling
sidebar_label: Error Handling
---

## Example

```javascript
import PeerData from 'peer-data';

const servers = {
  iceServers: [
    {url: "stun:stun.1.google.com:19302"}
  ]
};

const peerData = new PeerData(servers);
const room = peerData.connect('test-room');

room
    // you can catch errors here to know if the peer connection init failed
    .on("error", event => console.log(event));
    .on("participant", participant => {
            //here you can catch errors for ice candidates negotiation
            //and setting remote description (only for getting an answer)
            //remote description errors provided by offer are thrown by promise
            participant.on("error", event => {
                console.log("error", event);

                // You can renegotiate connection with peer by calling
                participant.renegotiate();
            })
    });
```
