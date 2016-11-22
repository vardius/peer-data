/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {LogLevel} from "./logger";

export interface IConfiguration {
    config: Config;
    servers: RTCConfiguration;
    logLevel: LogLevel;
}

class Configuration implements IConfiguration {
    private _config: Config;

    set config(value: Config) {
        this._config = value;
    }

    get config(): Config {
        return this._config;
    }

    get servers(): RTCConfiguration {
        return this._config.servers;
    }

    get logLevel(): LogLevel {
        return this._config.logLevel;
    }
}

export const config: IConfiguration = new Configuration();

export default class Config {
    servers: RTCConfiguration;
    logLevel: LogLevel = LogLevel.ERROR;
}
