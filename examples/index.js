import PeerData, { EventDispatcher } from "peer-data";

// Custom signaling system (we do not built in socket.io for local example)
const localSignalingChannel = EventDispatcher.getInstance();
localSignalingChannel.register("send", (event) => {
  console.log("EventDispatcher:send", event);
  localSignalingChannel.dispatch(event.type, event);
});

// Set up servers
const servers = {
  iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

const localPeerData = new PeerData(servers);
const remotePeerData = new PeerData(servers);

// get video/voice stream
navigator.getUserMedia({ video: true, audio: true }, gotMedia, () => {});

function gotMedia(stream) {
  window.stream = stream; // make variable available to browser console

  const video = document.querySelector("#localVideo");
  video.srcObject = stream;
}

async function connect(e) {
  // share our stream
  window.room = localPeerData.connect("test-room", window.stream);
  window.room
    // you can catch errors here to know if the peer connection init failed
    .on("error", (event) => console.log(event))
    .on("participant", (participant) => {
      //this peer shared a stream
      participant.on("track", (event) => {
        const video = document.querySelector("#remoteVideo");
        video.srcObject = event.streams[0];
      });
    });

  // remote stream will receive our local stream and share it back for purpose of this example
  remoteRoom = remotePeerData.connect("test-room");
  remoteRoom
    // you can catch errors here to know if the peer connection init failed
    .on("error", (event) => console.log(event))
    .on("participant", (participant) => {
      //this peer disconnected from room
      participant.on("disconnected", () => remoteRoom.disconnect());
      
      //this peer shared a stream
      participant.on("track", (event) => {
        participant.addStream(event.streams[0]);
        participant.renegotiate();
      });
    });
}

document.querySelector("#connect").addEventListener("click", (e) => connect(e));
document
  .querySelector("#disconnect")
  .addEventListener("click", (e) => window.room.disconnect());
