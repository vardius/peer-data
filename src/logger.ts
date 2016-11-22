/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export enum LogLevel {
    INFO,
    WARN,
    ERROR,
    OFF,
}

export default class Logger {
    static info(data) {
        this.trace(data, 'log');
    }

    static log(data) {
        this.trace(data, 'log');
    }

    static warn(data) {
        this.trace(data, 'warn');
    }

    static error(data) {
        this.trace(data, 'error');
    }

    private static trace(data, method) {
        if (window.performance) {
            var now = (window.performance.now() / 1000).toFixed(3);
            if (data instanceof Error) {
                console[method](now + ': ', data.toString(), data);
            }
            console[method](now + ': ', data);
        } else {
            console[method](data);
        }
    }
}