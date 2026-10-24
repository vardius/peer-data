import type { Participant } from 'peer-data';

/** The size of message every browser's data channel carries. */
const CHUNK = 16 * 1024;
/** How much to let the channel buffer before waiting: browsers refuse sends past a limit of their own. */
const HIGH_WATER = 1024 * 1024;

/**
 * Sends bytes to participant in pieces, waiting whenever its channel has buffered enough. Rejects if the
 * participant disconnects first.
 */
export async function sendLarge(participant: Participant, bytes: Uint8Array<ArrayBuffer>): Promise<void> {
  const { channel } = participant;
  if (channel.readyState === 'connecting') await settled(channel, 'open');
  channel.bufferedAmountLowThreshold = HIGH_WATER / 2;
  for (let offset = 0; offset < bytes.byteLength; offset += CHUNK) {
    if (channel.bufferedAmount > HIGH_WATER) await settled(channel, 'bufferedamountlow');
    participant.send(bytes.subarray(offset, offset + CHUNK));
  }
}

/** Collects the next size bytes participant sends. */
export function receiveLarge(participant: Participant, size: number): Promise<Uint8Array<ArrayBuffer>> {
  const bytes = new Uint8Array(size);
  let received = 0;
  return new Promise((resolve) => {
    const onMessage = (data: string | ArrayBuffer): void => {
      if (typeof data === 'string') return;
      bytes.set(new Uint8Array(data), received);
      received += data.byteLength;
      if (received < size) return;
      participant.off('message', onMessage);
      resolve(bytes);
    };
    participant.on('message', onMessage);
  });
}

/** Resolves once channel fires type, or closes: a send after that throws. */
function settled(channel: RTCDataChannel, type: 'open' | 'bufferedamountlow'): Promise<void> {
  return new Promise((resolve) => {
    const done = (): void => {
      channel.removeEventListener(type, done);
      channel.removeEventListener('close', done);
      resolve();
    };
    channel.addEventListener(type, done);
    channel.addEventListener('close', done);
  });
}
