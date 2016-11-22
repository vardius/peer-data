/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import "webrtc-adapter";
import Config, {configuration} from "./config";
import {IConnection, connection} from "./connection";

interface IApp {
    connect(): IConnection;
    disconnect();
}

export class App implements IApp {

    constructor(config: Config) {
        configuration.config = config;
    }

    connect(): IConnection {
        return connection;
    }

    disconnect() {
        Object.entries(connection.channels())
            .forEach(([key, value]) => value.close());
        Object.entries(connection.peers())
            .forEach(([key, value]) => value.close());
    }
}
