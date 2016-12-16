#Usage

[WebRTC Chat](https://github.com/Vardius/webrtc-chat) server-less example application.

##Configure PeerData client

###Set connection configuration
```javascript
import PeerData from 'peer-data';

let servers = {
  iceServers: [
    {url: "stun:stun.1.google.com:19302"}
  ]
};
PeerData.servers = servers;
```

###Set data channels configuration
```javascript
import PeerData from 'peer-data';

let constraints = {ordered: true};
PeerData.dataConstraints = constraints;
```

## Connect to signaling server

`PeerData` needs signaling server to work.
Before `connect` you need to set signaling server.
You can use default signaling server.

```javascript
import PeerData, {SocketChannel} from 'peer-data';

let signaling = new SocketChannel();
PeerData.signaling = signaling;

PeerData.connect();
```

[PeerDataServer](https://github.com/Vardius/peer-data-server) example of socket.io signaling server implementation for `SocketChannel`. 

## Subscribe Data Channel Events
```javascript
import PeerData, {EventType} from 'peer-data';

PeerData.on(EventType.OPEN, () => console.log('New peer connected'));
PeerData.on(EventType.CLOSE, () => console.log('Peer disconected'));
PeerData.on(EventType.DATA, event => console.log(event));
PeerData.on(EventType.ERROR, event => console.log(event));
```

## Send data
```javascript
import PeerData from 'peer-data';

let data = {message: 'Hi there!'};
let peerData = new PeerData();
peerData.send(data);
```

or send it do specific peers only

```javascript
import PeerData from 'peer-data';

let ids = ['123', '321'];
let data = {message: 'Hi there!'};
let peerData = new PeerData();
peerData.send(data, ids);
```

## Disconnect
```javascript
import PeerData from 'peer-data';

let peerData = new PeerData();
peerData.disconnect();
```

or disconnect specific peers only

```javascript
import PeerData from 'peer-data';

let ids = ['123', '321'];
let peerData = new PeerData();
peerData.disconnect(ids);
```

## Advance configuration
- [Signaling](signaling.md)
- [Logger](logger.md)