import { EventDispatcher } from './EventDispatcher';
import { SignalingEventType } from './SignalingEventType';
import { EventHandler } from './EventHandler';
import { SignalingEvent } from './SignalingEvent';
import { Configuration } from './Configuration';
import { Room } from './Room';

export class Participant {
    private id: string;
    private room: Room;
    private peer: RTCPeerConnection;
    private channel: RTCDataChannel;
    private dispatcher: EventDispatcher = new EventDispatcher();
    private remoteDesc: RTCSessionDescription;

    constructor(id: string, room: Room, remoteDesc: RTCSessionDescription = null) {
        this.id = id;
        this.room = room;
        this.remoteDesc = remoteDesc;

        this.onAnswer = this.onAnswer.bind(this);
        this.onCandidate = this.onCandidate.bind(this);

        this.peer = new RTCPeerConnection(Configuration.getInstance().getServers());
        this.peer.onicecandidate = this.onIceCandidate.bind(this);
        this.peer.onconnectionstatechange = this.onConnectionStateChange.bind(this);
        this.peer.oniceconnectionstatechange = this.onIceConnectionStateChange.bind(this);
        this.peer.ondatachannel = this.onDataChannel.bind(this);
        this.peer.ontrack = this.onTrack.bind(this);

        const stream = this.room.getStream();
        if (stream instanceof MediaStream) {
            stream.getTracks().map(track => this.peer.addTrack(track, stream));
        }
    }

    getId(): string {
        return this.id;
    }

    async init() {
        if (this.remoteDesc) {
            return await this.peer
                .setRemoteDescription(this.remoteDesc)
                .then(_ => this.peer.createAnswer())
                .then((desc: RTCSessionDescription) => this.peer.setLocalDescription(desc))
                .then(async _ => EventDispatcher.getInstance().dispatch('send', {
                    type: SignalingEventType.ANSWER,
                    caller: null,
                    callee: { id: this.id },
                    room: { id: this.room.getId() },
                    payload: this.peer.localDescription,
                } as SignalingEvent))
                .then(async _ => this);
        } else {
            this.channel = this.newDataChannel(Configuration.getInstance().getDataConstraints());
            this.channel.onmessage = this.onMessage.bind(this);

            return await this.peer
                .createOffer()
                .then((desc: RTCSessionDescription) => this.peer.setLocalDescription(desc))
                .then(async _ => EventDispatcher.getInstance().dispatch('send', {
                    type: SignalingEventType.OFFER,
                    caller: null,
                    callee: { id: this.id },
                    room: { id: this.room.getId() },
                    payload: this.peer.localDescription,
                } as SignalingEvent))
                .then(async _ => this);
        }
    }

    on(event: string, callback: EventHandler) {
        this.dispatcher.register(event, callback);
    }

    send(payload: any) {
        if (this.channel.readyState === 'open') {
            this.channel.send(payload);
        }
    }

    close() {
        this.channel.close();
        this.peer.close();
        this.dispatcher.dispatch('disconnected');
    }

    handleEvent(event: SignalingEvent) {
        if (this.id !== event.caller.id) {
            return;
        }

        switch (event.type) {
            case SignalingEventType.ANSWER:
                this.onAnswer(event);
                break;
            case SignalingEventType.CANDIDATE:
                this.onCandidate(event);
                break;
        }
    }

    private onAnswer(event: SignalingEvent) {
        this.peer
            .setRemoteDescription(new RTCSessionDescription(event.payload))
            .catch((evnt: DOMException) => this.dispatcher.dispatch('error', evnt));
    }

    private onCandidate(event: SignalingEvent) {
        this.peer
            .addIceCandidate(new RTCIceCandidate(event.payload))
            .catch((evnt: DOMException) => this.dispatcher.dispatch('error', evnt));
    }

    private newDataChannel(dataConstraints: RTCDataChannelInit) {
        const label = Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);

        return this.peer.createDataChannel(label, dataConstraints);
    }

    private onIceCandidate(iceEvent: RTCPeerConnectionIceEvent) {
        if (iceEvent.candidate) {
            EventDispatcher.getInstance().dispatch('send', {
                type: SignalingEventType.CANDIDATE,
                caller: null,
                callee: { id: this.id },
                room: { id: this.room.getId() },
                payload: iceEvent.candidate,
            } as SignalingEvent);
        } else {
            // All ICE candidates have been sent
        }
    }

    private onConnectionStateChange() {
        switch (this.peer.connectionState) {
            case 'disconnected':
            case 'failed':
            case 'closed':
                this.dispatcher.dispatch('disconnected');
                break;
        }
    }

    private onIceConnectionStateChange() {
        switch (this.peer.iceConnectionState) {
            case 'disconnected':
            case 'failed':
            case 'closed':
                this.dispatcher.dispatch('disconnected');
                break;
        }
    }

    private onDataChannel(event: RTCDataChannelEvent) {
        this.channel = event.channel;
        this.channel.onmessage = this.onMessage.bind(this);
    }

    private onMessage(event) {
        this.dispatcher.dispatch('message', event.data);
    }

    private onTrack(event: RTCTrackEvent) {
        this.dispatcher.dispatch('track', event);
    }
}
