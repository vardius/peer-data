const dispatcher = new window.EventDispatcher();
const signaling = new window.SocketChannel(dispatcher, 'http://localhost:3000');

// Set up servers
const servers = {
  iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

const peerData = new window.PeerData(dispatcher, servers);

// remote stream will receive our local stream and share it back for purpose of this example
const room = peerData.connect("test-room");
room
  // you can catch errors here to know if the peer connection init failed
  .on("error", (event) => console.log(event))
  .on("participant", (participant) => {
    //this peer disconnected from room
    participant.on("disconnected", () => room.disconnect());

    //this peer shared a stream
    participant.on("track", (event) => {
      participant.addStream(event.streams[0]);
      participant.renegotiate();
    });
  });
