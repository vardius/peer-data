import { BroadcastChannelSignaling } from 'peer-data';
import { joinCall } from './video.js';

const videos = document.querySelector<HTMLDivElement>('#videos');
const start = document.querySelector<HTMLButtonElement>('#start');
const status = document.querySelector<HTMLParagraphElement>('#status');
if (!videos || !start || !status) throw new Error('video page markup is missing');

/** A muted, playing video element for stream. */
function videoFor(stream: MediaStream, muted: boolean): HTMLVideoElement {
  const video = document.createElement('video');
  video.autoplay = true;
  video.playsInline = true;
  video.muted = muted;
  video.srcObject = stream;
  return video;
}

const startCall = async (): Promise<void> => {
  start.disabled = true;
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch (error) {
    status.textContent = `No camera: ${String(error)}`;
    start.disabled = false;
    return;
  }
  videos.append(videoFor(stream, true));
  status.textContent = 'Sharing your camera with every other tab that joins.';

  const remote = new Map<string, HTMLVideoElement>();
  const call = joinCall(new BroadcastChannelSignaling('peer-data-video'), stream, {
    stream: (id, theirs) => {
      const existing = remote.get(id);
      if (existing) {
        existing.srcObject = theirs;
        return;
      }
      const video = videoFor(theirs, false);
      remote.set(id, video);
      videos.append(video);
    },
    left: (id) => {
      remote.get(id)?.remove();
      remote.delete(id);
    },
  });
  window.addEventListener('pagehide', call.leave);
};

// A page restored from the back-forward cache has left its call: start afresh.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) location.reload();
});

start.addEventListener('click', () => {
  void startCall();
});
