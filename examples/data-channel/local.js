// Custom signaling system (we do not built in socket.io for local example)
window.localDispatcher.register("send", (event) => {
  console.log("localDispatcher:send", event);
  window.remoteDispatcher.dispatch(event.type, event);
});

const constraints = {ordered: true};
const servers = {
  iceServers: [{ urls: "stun:stun.1.google.com:19302" }],
};

const peerData = new window.PeerData(window.localDispatcher, servers, constraints);
let room = null;
let remoteParticipant = null;

async function connect(e) {
  if (room) {
    return;
  }

  // share our stream
  room = peerData.connect("test-room");
  room
    // you can catch errors here to know if the peer connection init failed
    .on("error", (event) => console.error("local:error", event))
    .on("participant", (participant) => {
      remoteParticipant = participant;
    
      // handle this participant error
      participant.on("error", (event) => console.error("participant:error", event));
    });
}

async function disconnect(e) {
  if (room) {
    room.disconnect();
    console.log('btn:disconnect');
    room = null;
    remoteParticipant = null;
  }
}

async function send(e) {
  if (remoteParticipant) {
    remoteParticipant.send(document.getElementById("localMessage").value);
    document.getElementById("localMessage").value = '';
  }
}

document.querySelector("#send").addEventListener("click", (e) => send(e));
document.querySelector("#connect").addEventListener("click", (e) => connect(e));
document.querySelector("#disconnect").addEventListener("click", (e) => disconnect(e));
