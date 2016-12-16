#Usage

##Configure Signaling

###Override signaling

Create custom signaling class remember to implement [Signaling](../src/app/signaling/signaling.ts) interface

```javascript
import PeerData from 'peer-data';

class SignalingChannel{}

let peerData = new PeerData();
peerData.signaling = new SignalingChannel();
```

For server less implementation you can check [WebRTC Chat Signaling](https://github.com/Vardius/webrtc-chat/blob/master/src/app/signaling.js) implementation.