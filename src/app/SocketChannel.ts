import { Signaling } from "./Signaling";
import { SignalingEvent } from "./SignalingEvent";
import { EventDispatcher } from "./EventDispatcher";
import * as io from "socket.io-client";

export class SocketChannel implements Signaling {
  private socket: SocketIOClient.Socket;

  constructor(opts?: SocketIOClient.ConnectOpts) {
    this.socket = io.connect(opts);

    EventDispatcher.getInstance().register("send", this.onSend);

    this.subscribeEvents();
  }

  onSend = (event: SignalingEvent) => {
    this.socket.emit("message", event);
  };

  private subscribeEvents() {
    this.socket.on("message", this.onMessage);
    this.socket.on("ipaddr", this.onIp);
    this.socket.on("log", this.onLog);
  }

  private onIp = (ipaddr: string) => {
    EventDispatcher.getInstance().dispatch("log", "Server IP address is: " + ipaddr);
  };

  private onLog = (...args: any[]) => {
    EventDispatcher.getInstance().dispatch("log", args);
  };

  private onMessage = (event: SignalingEvent) => {
    EventDispatcher.getInstance().dispatch(event.type, event);
  };
}
