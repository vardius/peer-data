/**
 * This file is part of the video-rtc package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import {Device} from "./device";

/**
 * Media class allows to get stream from video/audio input
 * and change output inputs for DOM element, by device id
 */
export class Media {
    private stream;
    private audioInput;
    private videoInput;
    private devices;
    private constraints;

    /**
     * @param constraints
     */
    constructor(constraints) {
        this.constraints = constraints;
        this.init();
    }

    /**
     * Change Audio Output Device for media DOM element
     * @param element
     * @param output
     */
    changeAudioOutput(element, output) {
        if (output.kind === 'audiooutput') {
            this.throwError('Wrong output device!');
        } else {
            this.attachSinkId(element, output.id);
        }
    }

    /**
     * Change Audio Input Device
     * @param input
     */
    changeAudioInput(input) {
        if (input.kind === 'audioinput') {
            this.throwError('Wrong input device!');
        } else {
            this.audioInput = input;
            this.init();
        }
    }

    /**
     * Change Video Input Device
     * @param input
     */
    changeVideoInput(input) {
        if (input.kind === 'videoinput') {
            this.throwError('Wrong input device!');
        } else {
            this.videoInput = input;
            this.init();
        }
    }

    /**
     * Get input/output devices collection sorted by kind
     * @returns {Devices}
     */
    getDevices() {
        return this.devices;
    }

    /**
     * Get media stream
     * @returns {any}
     */
    getStream() {
        return this.stream;
    }

    /**
     * Initialize users media
     */
    init() {
        if (this.stream) {
            this.stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        if (this.constraints.audio) {
            Object.assign(this.constraints.audio, {deviceId: this.audioInput ? {exact: this.audioInput.id} : undefined});
        }

        if (this.constraints.video) {
            Object.assign(this.constraints.video, {deviceId: this.videoInput ? {exact: this.videoInput.id} : undefined});
        }

        navigator.mediaDevices.getUserMedia(this.constraints).then(this.gotStream).then(this.gotDevices).catch(this.throwError);
    }

    /**
     * Get users media stream callback
     * @param stream
     * @returns {any}
     */
    gotStream(stream) {
        this.stream = stream;
        return navigator.mediaDevices.enumerateDevices();
    }

    /**
     * Get users media devices callback
     * @param deviceInfos
     */
    gotDevices(deviceInfos) {
        this.devices = {
            audioInput: [],
            audioOutput: [],
            videoInput: [],
        };
        for (let i = 0; i !== deviceInfos.length; ++i) {
            let deviceInfo = deviceInfos[i];
            let device = new Device(deviceInfo.deviceId, deviceInfo.label, deviceInfo.kind);
            if (device.kind === 'audioinput') {
                this.devices.audioInput.push(device);
            } else if (device.kind === 'audiooutput') {
                this.devices.audioOutput.push(device);
            } else if (device.kind === 'videoinput') {
                this.devices.videoInput.push(device);
            }
        }
    }

    /**
     * Attach audio output device to video element using device/sink ID.
     * @param element
     * @param sinkId
     */
    attachSinkId(element, sinkId) {
        if (typeof element.sinkId !== 'undefined') {
            element.setSinkId(sinkId)
                .then(function () {
                    console.log('Success, audio output device attached: ' + sinkId);
                })
                .catch(function (error) {
                    let errorMessage = error;
                    if (error.name === 'SecurityError') {
                        errorMessage = 'You need to use HTTPS for selecting audio output ' + 'device: ' + error;
                    }
                    this.throwError(errorMessage);
                });
        } else {
            console.warn('Browser does not support output device selection.');
        }
    }

    /**
     * Throw error
     * @param error
     */
    throwError(error) {
        console.log(error);
    }
}
