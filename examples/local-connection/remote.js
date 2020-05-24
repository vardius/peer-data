window.remoteDispatcher.register("send", (event) => {
  console.log("remoteDispatcher:send", event);
  window.localDispatcher.dispatch(event.type, event);
});

// Set up servers
const servers = {
  iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

const peerData = new window.PeerData(window.remoteDispatcher, servers);

// remote stream will receive our local stream and share it back for purpose of this example
const room = peerData.connect("test-room");
room
  // you can catch errors here to know if the peer connection init failed
    .on("error", (event) => console.error("remote:error", event))
  .on("participant", (participant) => {
    //this peer disconnected from room
    participant.on("disconnected", () => {
      console.log("remote:disconnected", event);
      room.disconnect();
    });

    //this peer shared a stream
    participant.on("track", (event) => {
      console.log("remote:track", event);
      participant.addStream(event.streams[0]);
      participant.renegotiate();
    });
  });
