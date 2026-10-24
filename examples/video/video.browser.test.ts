import { afterEach, expect, test } from 'vitest';
import { BroadcastChannelSignaling } from 'peer-data';
import { joinCall } from './video.js';

const left: (() => void)[] = [];

afterEach(() => {
  for (const leave of left.splice(0)) leave();
});

/** A video stream that needs no camera. */
function canvasStream(): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.getContext('2d')?.fillRect(0, 0, 10, 10);
  return canvas.captureStream();
}

test('each side receives the stream the other shares', async () => {
  const name = `call-${String(Math.random())}`;
  const received = [0, 1].map(
    () =>
      new Promise<MediaStream>((resolve) => {
        const call = joinCall(new BroadcastChannelSignaling(name), canvasStream(), {
          stream: (_id, stream) => {
            resolve(stream);
          },
          left: () => undefined,
        });
        left.push(call.leave);
      }),
  );

  const streams = await Promise.all(received);

  for (const stream of streams) expect(stream.getVideoTracks()).toHaveLength(1);
});
