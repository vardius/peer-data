/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {LogLevel} from "./log-level";

export interface Logger {
    logLevel: LogLevel;
    info(data: any): void;
    log(data: any): void;
    warn(data: any): void;
    error(data: any): void;
}
