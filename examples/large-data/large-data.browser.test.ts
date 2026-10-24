import { afterEach, expect, test } from 'vitest';
import { PeerData, type Participant } from 'peer-data';
import { Hub } from '../../test/hub.js';
import { receiveLarge, sendLarge } from './large-data.js';

const open: PeerData[] = [];

afterEach(() => {
  for (const peer of open.splice(0)) peer.close();
});

async function pair(): Promise<{ sender: Participant; receiver: Participant }> {
  const hub = new Hub();
  const a = new PeerData(hub.connect());
  const b = new PeerData(hub.connect());
  open.push(a, b);
  const roomA = a.connect('room');
  const toB = new Promise<Participant>((resolve) => roomA.on('participant', resolve));
  const roomB = b.connect('room');
  const toA = new Promise<Participant>((resolve) => roomB.on('participant', resolve));
  const [sender, receiver] = await Promise.all([toB, toA]);
  return { sender, receiver };
}

function randomBytes(size: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(size);
  // getRandomValues fills at most 64 KiB at a time.
  for (let offset = 0; offset < size; offset += 65_536) {
    crypto.getRandomValues(bytes.subarray(offset, Math.min(offset + 65_536, size)));
  }
  return bytes;
}

test('more than a channel buffers arrives whole', async () => {
  const { sender, receiver } = await pair();
  // Past the 16 MiB a channel buffers in Chromium: sent in one go, the sends would throw.
  const bytes = randomBytes(20 * 1024 * 1024);
  const arrived = receiveLarge(receiver, bytes.byteLength);

  await sendLarge(sender, bytes);
  const received = await arrived;

  expect(received.byteLength).toBe(bytes.byteLength);
  expect(received.every((byte, i) => byte === bytes[i])).toBe(true);
}, 60_000);

test('sending to a participant that disconnects rejects', async () => {
  const { sender } = await pair();
  const sending = sendLarge(sender, randomBytes(20 * 1024 * 1024));
  sender.close();

  await expect(sending).rejects.toThrow('disconnected');
});
