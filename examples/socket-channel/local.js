const dispatcher = new window.EventDispatcher();
const signalling = new window.SocketChannel(dispatcher, 'http://localhost:3000');

// Set up servers
const servers = {
  iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

const peerData = new window.PeerData(dispatcher, servers);
let room = null;

// get video/voice stream
navigator.getUserMedia({ video: true, audio: true }, gotMedia, () => {});

function gotMedia(stream) {
  window.stream = stream; // make variable available to browser console

  const video = document.querySelector("#localVideo");
  video.srcObject = stream;
}

async function connect(e) {
  if (!room) {
    return;
  }

  // share our stream
  room = peerData.connect("test-room", window.stream);
  room
    // you can catch errors here to know if the peer connection init failed
    .on("error", (event) => console.log(event))
    .on("participant", (participant) => {
      //this peer shared a stream
      participant.on("track", (event) => {
        const video = document.querySelector("#remoteVideo");
        video.srcObject = event.streams[0];
      });
    });
}

async function disconnect(e) {
  if (room) {
    room.disconnect();
    room = null;
  }
}

document.querySelector("#connect").addEventListener("click", (e) => connect(e));
document.querySelector("#disconnect").addEventListener("click", (e) => disconnect(e));
