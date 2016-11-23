/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {ILogger, ConsoleLogger, LogLevel} from "./logger";
import {ISignaling, SocketChannel} from "./signaling";
import {IConnection, Connection} from "./connection";

export class Config {
    private _servers: RTCConfiguration;
    private _logger: ILogger;
    private _signalling: ISignaling;
    private _connection: IConnection;

    constructor(servers: RTCConfiguration = {}, logLevel: LogLevel = LogLevel.ERROR) {
        this._servers = servers;
        this._logger = new ConsoleLogger(logLevel);
        this._signalling = new SocketChannel();
        this._connection = new Connection();
    }

    get servers(): RTCConfiguration {
        return this._servers;
    }

    set servers(value: RTCConfiguration) {
        this._servers = value;
    }

    get logger(): ILogger {
        return this._logger;
    }

    set logger(value: ILogger) {
        this._logger = value;
    }

    get signalling(): ISignaling {
        return this._signalling;
    }

    set signalling(value: ISignaling) {
        this._signalling = value;
    }

    get connection(): IConnection {
        return this._connection;
    }

    set connection(value: IConnection) {
        this._connection = value;
    }
}
