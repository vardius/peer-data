/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {config} from "./config";

export enum LogLevel {
    INFO,
    WARN,
    ERROR,
    OFF,
}

export default class Logger {
    static info(data: any) {
        this.trace(data, 'log');
    }

    static log(data: any) {
        this.trace(data, 'log');
    }

    static warn(data: any) {
        this.trace(data, 'warn');
    }

    static error(data: any) {
        this.trace(data, 'error');
    }

    private static trace(data: any, method: string) {
        if (config.logLevel === LogLevel.OFF) {
            return;
        }
        if (config.logLevel === LogLevel.WARN && method === 'error') {
            return;
        }
        if (config.logLevel === LogLevel.INFO && (method === 'error' || method === 'warn')) {
            return;
        }

        if (window.performance) {
            var now = (window.performance.now() / 1000).toFixed(3);
            if (data instanceof Error) {
                console[method](now + ': ' + data.toString(), data);
            }
            console[method](now + ': ', data);
        } else {
            console[method](data);
        }
    }
}