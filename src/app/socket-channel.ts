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
import {CONFIG} from "./app";

export class SocketChannel implements Signaling.Signaling {
    private socket: Socket;

    constructor() {
        this.socket = io.connect();
        this.socket.on('message', this.onMessage);
        this.socket.on('ipaddr', this.onIp);
        this.socket.on('log', this.onLog);
    }

    send(event: Signaling.SignalingEvent) {
        this.socket.emit('message', event);
    }

    private onIp(ipaddr: string) {
        CONFIG.logger.log('Server IP address is: ' + ipaddr);
    }

    private onLog(data: any[]) {
        CONFIG.logger.log(data);
    }

    private onMessage(event: Signaling.SignalingEvent) {
        switch (event.type) {
            case 'offer':
                Bridge.onOffer(event);
                break;
            case 'answer':
                Bridge.onAnswer(event);
                break;
            case 'candidate':
                Bridge.onCandidate(event);
                break;
            case 'connect':
                Bridge.onConnect(event);
                break;
            case 'disconnect':
                Bridge.onDisconnect(event);
                break;
        }
    }
}
