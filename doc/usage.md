# Usage

[WebRTC Chat](https://github.com/Vardius/webrtc-chat) server-less example application.

## Configure PeerData client

### Set connection configuration
```javascript
import PeerData from 'peer-data';

let servers = {
  iceServers: [
    {url: "stun:stun.1.google.com:19302"}
  ]
};
let peerData = new PeerData(servers);
```

Or after initialization

```javascript
import PeerData from 'peer-data';

let servers = {
  iceServers: [
    {url: "stun:stun.1.google.com:19302"}
  ]
};
let peerData = new PeerData();
peerData.servers = servers;
```

### Set data channels configuration
```javascript
import PeerData from 'peer-data';

let constraints = {ordered: true};
let peerData = new PeerData({}, constraints);
```

Or after initialization

```javascript
import PeerData from 'peer-data';

let constraints = {ordered: true};
let peerData = new PeerData();
peerData.dataConstraints = constraints;
```

## Connect to signaling server

`PeerData` needs signaling server to work.
Before `connect` you need to set signaling server.
You can use default signaling server.

```javascript
import PeerData, {SocketChannel} from 'peer-data';

let signaling = new SocketChannel();
let peerData = new PeerData();

peerData.signaling = signaling;
peerData.connect();
```

[PeerDataServer](https://github.com/Vardius/peer-data-server) example of socket.io signaling server implementation for `SocketChannel`. 

## Subscribe Data Channel Events
```javascript
import PeerData, {EventType} from 'peer-data';

let peerData = new PeerData();

peerData.on(EventType.OPEN, () => console.log('New peer connected'));
peerData.on(EventType.CLOSE, () => console.log('Peer disconected'));
peerData.on(EventType.DATA, event => console.log(event));
peerData.on(EventType.ERROR, event => console.log(event));
peerData.on(EventType.LOG, event => console.log(event));
```

## Send data
```javascript
import PeerData from 'peer-data';

let data = {message: 'Hi there!'};
let peerData = new PeerData();
peerData.send(data);
```

## Disconnect
```javascript
import PeerData from 'peer-data';

let peerData = new PeerData();
peerData.disconnect();
```

## Advance configuration
- [Signaling](signaling.md)
