/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {LogLevel} from "./logger";

class Configuration {
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

    get constraint(): RTCMediaConstraints {
        return this._config.constraint;
    }

    get logLevel(): LogLevel {
        return this._config.logLevel;
    }
}

export const configuration: Configuration = new Configuration();

export default class Config {
    servers: RTCConfiguration;
    constraint: RTCMediaConstraints;
    logLevel: LogLevel = LogLevel.ERROR;
}
