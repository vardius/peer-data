// Custom signaling system (we do not built in socket.io for local example)
window.localDispatcher.register("send", (event) => {
  console.log("localDispatcher:send", event);
  window.remoteDispatcher.dispatch(event.type, event);
});

// Set up servers
const servers = {
  iceServers: [{ urls: "stun:stun.1.google.com:19302" }],
};

const peerData = new window.PeerData(window.localDispatcher, servers);
let room = null;

// get video/voice stream
navigator.getUserMedia({ video: true, audio: true }, gotMedia, () => {});

function gotMedia(stream) {
  window.stream = stream; // make variable available to browser console

  const video = document.querySelector("#localVideo");
  video.srcObject = stream;
}

async function connect(e) {
  if (room) {
    return;
  }

  // share our stream
  room = peerData.connect("test-room", window.stream);
  room
    // you can catch errors here to know if the peer connection init failed
    .on("error", (event) => console.error("local:error", event))
    .on("participant", (participant) => {
      // handle this participant error
      participant.on("error", (event) => console.error("participant:error", event));

      //this peer shared a stream
      participant.on("track", (event) => {
        console.log("local:track", event);

        const video = document.querySelector("#remoteVideo");
        video.srcObject = event.streams[0];
      });
    });
}

async function disconnect(e) {
  if (room) {
    room.disconnect();
    console.log('btn:disconnect');
    room = null;
  }
}

document.querySelector("#connect").addEventListener("click", (e) => connect(e));
document.querySelector("#disconnect").addEventListener("click", (e) => disconnect(e));
