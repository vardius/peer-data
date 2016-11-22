/**
 * This file is part of the video-rtc package.
 *
 * (c) Rafał Lorenz <vardius@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import {Media} from "./media";

var video = document.getElementById('localVideo');
var media = new Media({video: true, audio: true});
var stream = media.getStream();

var streamURL = window.URL.createObjectURL(stream);
console.log('getUserMedia video stream URL:', streamURL);
video.src = streamURL;