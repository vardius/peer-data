/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {ConsoleLogger} from "./console-logger";
import {SocketChannel} from "./socket-channel";
import {DefaultConnection} from "./default-connection";

export class Config {
    private _servers: RTCConfiguration;
    private _logger: Logger.Logger;
    private _signalling: Signaling.Signaling;
    private _connection: Connection.Connection;

    constructor(servers: RTCConfiguration = {}, logLevel: Logger.LogLevel = Logger.LogLevel.ERROR) {
        this._servers = servers;
        this._logger = new ConsoleLogger(logLevel);
        this._signalling = new SocketChannel();
        this._connection = new DefaultConnection();
    }

    get servers(): RTCConfiguration {
        return this._servers;
    }

    set servers(value: RTCConfiguration) {
        this._servers = value;
    }

    get logger(): Logger.Logger {
        return this._logger;
    }

    set logger(value: Logger.Logger) {
        this._logger = value;
    }

    get signalling(): Signaling.Signaling {
        return this._signalling;
    }

    set signalling(value: Signaling.Signaling) {
        this._signalling = value;
    }

    get connection(): Connection.Connection {
        return this._connection;
    }

    set connection(value: Connection.Connection) {
        this._connection = value;
    }
}
