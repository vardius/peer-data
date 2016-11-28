/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Socket = SocketIOClient.Socket;
import * as io from "socket.io-client";
import {Bridge} from "./bridge";
import {CONFIG} from "./app";
import {Signaling} from "./signaling/signaling";
import {SignalingEvent} from "./signaling/event";
import {SignalingEventType} from "./signaling/event-type";

export class SocketChannel implements Signaling {
    private socket: Socket;

    constructor(opts?: SocketIOClient.ConnectOpts) {
        this.socket = io.connect(opts);
        this.socket.on('message', this.onMessage);
        this.socket.on('ipaddr', this.onIp);
        this.socket.on('log', this.onLog);
    }

    send(event: SignalingEvent) {
        this.socket.emit('message', event);
    }

    private onIp(ipaddr: string) {
        CONFIG.logger.log.apply(CONFIG.logger, ['Server IP address is: ' + ipaddr]);
    }

    private onLog(data: any[]) {
        CONFIG.logger.log.apply(CONFIG.logger, [data]);
    }

    private onMessage(event: SignalingEvent) {
        switch (event.type) {
            case SignalingEventType.OFFER:
                Bridge.onOffer(event);
                break;
            case SignalingEventType.ANSWER:
                Bridge.onAnswer(event);
                break;
            case SignalingEventType.CANDIDATE:
                Bridge.onCandidate(event);
                break;
            case SignalingEventType.CONNECT:
                Bridge.onConnect(event);
                break;
            case SignalingEventType.DISCONNECT:
                Bridge.onDisconnect(event);
                break;
        }
    }
}
