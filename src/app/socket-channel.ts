/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Socket = SocketIOClient.Socket;
import {Bridge} from "./bridge";

export class SocketChannel implements Signaling.Signaling {
    private socket: Socket;

    constructor() {
        this.socket = io.connect();
        this.socket.on('message', this.onMessage);
    }

    send(message: Signaling.SignalingEvent) {
        this.socket.emit('message', message);
    }

    private onMessage(event: Signaling.SignalingEvent) {
        switch (event.type) {
            case 'offer':
                Bridge.onOffer(event.caller, event.data);
                break;
            case 'answer':
                Bridge.onAnswer(event.caller, event.data);
                break;
            case 'candidate':
                Bridge.onCandidate(event.caller, event.data);
                break;
            case 'connect':
                Bridge.onConnect(event.caller);
                break;
            case 'disconnect':
                Bridge.onDisconnect(event.caller);
                break;
        }
    }
}
