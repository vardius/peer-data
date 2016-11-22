/**
 * This file is part of the video-rtc package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

/**
 * Output/Input device
 */
export class Device {
    private _id;
    private _label;
    private _kind;

    constructor(id, label, kind) {
        this._id = id;
        this._label = label;
        this._kind = kind;
    }

    get id() {
        return this._id;
    }

    get label() {
        return this._label;
    }

    get kind() {
        return this._kind;
    }
}