/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {LogLevel} from './logger/log-level';
import {Logger} from './logger/logger';

export class ConsoleLogger implements Logger {
    private _logLevel: LogLevel;

    constructor(logLevel: LogLevel) {
        this._logLevel = logLevel;
    }

    info(data: any) {
        this.trace(data, 'info');
    }

    log(data: any) {
        this.trace(data, 'log');
    }

    warn(data: any) {
        this.trace(data, 'warn');
    }

    error(data: any) {
        this.trace(data, 'error');
    }

    private trace(data: any, method: string) {
        if (this._logLevel === LogLevel.OFF) {
            return;
        }
        if (this._logLevel === LogLevel.WARN && method === 'error') {
            return;
        }
        if (this._logLevel === LogLevel.INFO && (method === 'error' || method === 'warn')) {
            return;
        }

        if (window.performance) {
            let now = (window.performance.now() / 1000).toFixed(3);
            if (data instanceof Error) {
                this.logToConsole(method, now + ': ' + data.toString(), data);
            }
            this.logToConsole(method, now + ': ', data);
        } else {
            this.logToConsole(method, data);
        }
    }

    private logToConsole(method: string, ...args: any[]) {
        switch (method) {
            case 'info':
                console.info.apply(console, args);
                break;
            case 'warn':
                console.warn.apply(console, args);
                break;
            case 'error':
                console.error.apply(console, args);
                break;
            default:
                console.log.apply(console, args);
                break;
        }
    }

    get logLevel(): LogLevel {
        return this._logLevel;
    }

    set logLevel(value: LogLevel) {
        this._logLevel = value;
    }
}
