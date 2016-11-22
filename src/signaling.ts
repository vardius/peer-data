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

export interface ICaller {
    id: string;
}

export interface IMessage {
    type: string;
    caller: ICaller;
    data: any;
}

export interface ISignaling {
    send(message);
}

class SocketChannel implements ISignaling {
    private socket: Socket;

    constructor() {
        this.socket = io.connect();
        this.socket.on('message', this.onMessage);
    }

    send(message: IMessage) {
        this.socket.emit('message', message);
    }

    private onMessage(message: IMessage) {
        switch (message.type) {
            case 'offer':
                Bridge.onOffer(message.caller, message.data);
                break;
            case 'answer':
                Bridge.onAnswer(message.caller, message.data);
                break;
            case 'candidate':
                Bridge.onCandidate(message.caller, message.data);
                break;
            case 'connect':
                Bridge.onConnect(message.caller);
                break;
            case 'disconnect':
                Bridge.onDisconnect(message.caller);
                break;
        }
    }
}

export const signaling: ISignaling = new SocketChannel();
