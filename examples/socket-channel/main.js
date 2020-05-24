import PeerData, { EventDispatcher, SocketChannel } from 'https://unpkg.com/peer-data@3.2.1/dist/index.es.js';

const localDispatcher = new EventDispatcher();
const remoteDispatcher = new EventDispatcher();

const localSignaling = new SocketChannel(localDispatcher, 'http://localhost:3000');
const remoteSignaling = new SocketChannel(remoteDispatcher, 'http://localhost:3000');

// Set up servers
const servers = {
  iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

const localPeerData = new PeerData(localDispatcher, servers);
const remotePeerData = new PeerData(remoteDispatcher, servers);

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
  const remoteRoom = remotePeerData.connect("test-room");
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
