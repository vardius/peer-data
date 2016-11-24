/**
 * This file is part of the peer-data package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Connection {
    export interface ConnectionEvent {
        caller: Signaling.Caller;
        callee: Signaling.Caller;
        data: any;
    }
}
