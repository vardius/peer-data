import { EventDispatcher } from './EventDispatcher';
import { SignalingEvent } from './SignalingEvent';
import { SignalingEventType } from './SignalingEventType';
import { Connection } from './Connection';
import { EventHandler } from './EventHandler';
import { PeerFactory } from './PeerFactory';
import { DataChannelFactory } from './DataChannelFactory';
import { AppEventType } from './AppEventType';

export class App {
  private servers: RTCConfiguration;
  private dataConstraints: RTCDataChannelInit;
  private connection: Connection;

  constructor(servers: RTCConfiguration = {}, dataConstraints: RTCDataChannelInit = null) {
    this.servers = servers;
    this.dataConstraints = dataConstraints;
    this.connection = new Connection();

    // We already have this peer return it
    EventDispatcher.register(SignalingEventType.ROOM, this._onRoom.bind(this));
    // We got connection offer create answer and establish connection
    EventDispatcher.register(SignalingEventType.OFFER, this._onOffer.bind(this));
    // Someone wants to connect create offer
    EventDispatcher.register(SignalingEventType.CONNECT, this._onConnect.bind(this));
    // Tell others we disconnected
    EventDispatcher.register(SignalingEventType.DISCONNECT, this._onDisconnect.bind(this));
  }

  on(event: string, callback: EventHandler) {
    EventDispatcher.register(event, callback);
  }

  onConnection(callback: EventHandler) {
    EventDispatcher.register(AppEventType.CONNECTION, callback);
  }

  onLog(callback: EventHandler) {
    EventDispatcher.register(AppEventType.LOG, callback);
  }

  connect(roomId: string) {
    EventDispatcher.dispatch(AppEventType.SEND, {
      type: SignalingEventType.CONNECT,
      caller: null,
      callee: null,
      room: { id: roomId },
      data: null,
    });
  }

  disconnect(roomId: string) {
    EventDispatcher.dispatch(AppEventType.SEND, {
      type: SignalingEventType.DISCONNECT,
      caller: null,
      callee: null,
      room: { id: roomId },
      data: null,
    });
    this.connection.removeRoom(roomId);
  }

  _onRoom(event: SignalingEvent) {
    const promise = new Promise((resolve, reject) => {
      const peer = this.connection.getPeer(event.caller.id);
      const channel = this.connection.getChannel(event.caller.id);
      resolve({ room: event.room, caller: event.caller, peer, channel });
    });

    EventDispatcher.dispatch(AppEventType.CONNECTION, promise);
  }

  _onOffer(mainEvent: SignalingEvent) {
    const promise = new Promise((resolve, reject) => {
      const peer = PeerFactory.get(this.servers, mainEvent);
      this.connection.addPeer(mainEvent.caller.id, peer);

      const onCandidate = (event: SignalingEvent) => {
        if (event.caller.id !== mainEvent.caller.id) {
          return;
        }

        peer
          .addIceCandidate(new RTCIceCandidate(event.data))
          .catch((evnt: DOMException) => reject(evnt));
      };

      peer.ondatachannel = (event: RTCDataChannelEvent) => {
        this.connection.addChannel(mainEvent.caller.id, event.channel);
        resolve({ room: mainEvent.room, caller: mainEvent.caller, peer, channel: event.channel });
      };
      peer
        .setRemoteDescription(new RTCSessionDescription(mainEvent.data))
        .then(() => peer.createAnswer())
        .then((desc: RTCSessionDescription) => peer.setLocalDescription(desc))
        .then(() => EventDispatcher.dispatch(AppEventType.SEND, {
          type: SignalingEventType.ANSWER,
          caller: null,
          callee: mainEvent.caller,
          room: mainEvent.room,
          data: peer.localDescription,
        }))
        .catch((evnt: DOMException) => reject(evnt));

      const handlerMap = new Map();
      handlerMap.set(SignalingEventType.CANDIDATE, onCandidate);
      this.connection.handlers.set(mainEvent.caller.id, handlerMap);
      EventDispatcher.register(SignalingEventType.CANDIDATE, onCandidate);
    });

    EventDispatcher.dispatch(AppEventType.CONNECTION, promise);
  }

  _onConnect(mainEvent: SignalingEvent) {
    const promise = new Promise((resolve, reject) => {
      let peer = this.connection.getPeer(mainEvent.caller.id);
      let channel = this.connection.getChannel(mainEvent.caller.id);
      if (null !== peer && null !== channel) {
        EventDispatcher.dispatch(AppEventType.SEND, {
          type: SignalingEventType.ROOM,
          caller: null,
          callee: mainEvent.caller,
          room: mainEvent.room,
          data: null,
        });

        resolve({ room: mainEvent.room, caller: mainEvent.caller, peer, channel });
      } else {
        peer = PeerFactory.get(this.servers, mainEvent);
        channel = DataChannelFactory.get(peer, this.dataConstraints);

        this.connection.addChannel(mainEvent.caller.id, channel);
        this.connection.addPeer(mainEvent.caller.id, peer);

        const onCandidate = (event: SignalingEvent) => {
          if (mainEvent.caller.id !== event.caller.id) {
            return;
          }

          peer
            .addIceCandidate(new RTCIceCandidate(event.data))
            .catch((evnt: DOMException) => reject(evnt));
        };

        const onAnswer = (event: SignalingEvent) => {
          if (mainEvent.caller.id !== event.caller.id) {
            return;
          }

          peer
            .setRemoteDescription(new RTCSessionDescription(event.data))
            .catch((evnt: DOMException) => reject(evnt));
        };

        peer
          .createOffer()
          .then((desc: RTCSessionDescription) => peer.setLocalDescription(desc))
          .then(() => EventDispatcher.dispatch(AppEventType.SEND, {
            type: SignalingEventType.OFFER,
            caller: null,
            callee: mainEvent.caller,
            room: mainEvent.room,
            data: peer.localDescription,
          }))
          .catch((evnt: DOMException) => reject(evnt));

        const handlerMap = new Map();
        handlerMap.set(SignalingEventType.ANSWER, onAnswer);
        handlerMap.set(SignalingEventType.CANDIDATE, onCandidate);
        this.connection.handlers.set(mainEvent.caller.id, handlerMap);
        EventDispatcher.register(SignalingEventType.ANSWER, onAnswer);
        EventDispatcher.register(SignalingEventType.CANDIDATE, onCandidate);

        resolve({ room: mainEvent.room, caller: mainEvent.caller, peer, channel });
      }
    });

    EventDispatcher.dispatch(AppEventType.CONNECTION, promise);
  }

  _onDisconnect(event: SignalingEvent) {
    if (!event.room) {
      this.connection.removeChannel(event.caller.id);
      this.connection.removePeer(event.caller.id);
    } else {
      // todo: close peer if this room was our only connection
    }
  }
}
