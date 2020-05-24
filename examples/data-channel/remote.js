window.remoteDispatcher.register("send", (event) => {
  console.log("remoteDispatcher:send", event);
  window.localDispatcher.dispatch(event.type, event);
});

const constraints = {ordered: true};
const servers = {
  iceServers: [{ urls: "stun:stun.1.google.com:19302" }],
};

const peerData = new window.PeerData(window.remoteDispatcher, servers, constraints);
let room = null;

async function connect(e) {
  if (room) {
    return;
  }

  // remote stream will receive our local stream and share it back for purpose of this example
  room = peerData.connect("test-room");
  room
    // you can catch errors here to know if the peer connection init failed
    .on("error", (event) => console.error("remote:error", event))
    .on("participant", (participant) => {
      // handle this participant error
      participant.on("error", (event) => console.error("participant:error", event));

      participant.on("message", payload => {
        if (document.getElementById("remoteMessage").value !== "") {
          document.getElementById("remoteMessage").value += "\n"
        }
        document.getElementById("remoteMessage").value += payload
      });

      // this peer disconnected from room
      participant.on("disconnected", () => {
        console.log("remote:disconnected", event);

        // local peer has disconnected so we do the same, leave the room
        room.disconnect();
        room = null;
      });
    });
}

  document.querySelector("#connect").addEventListener("click", (e) => connect(e));