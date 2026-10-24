import { afterEach, expect, inject, test } from 'vitest';
import { io, type Socket } from 'socket.io-client';
import { PeerData, SocketChannel, type Participant } from 'peer-data';
import { joinChat, type Line } from '../chat/chat.js';

const cleanup: (() => void)[] = [];

afterEach(() => {
  for (const close of cleanup.splice(0)) close();
});

function socket(): Socket {
  const created = io(inject('signalingUrl'), { transports: ['websocket'] });
  cleanup.push(() => created.close());
  return created;
}

test('the chat works over the socket.io signaling server', async () => {
  let ready: () => void = () => undefined;
  const connected = new Promise<void>((resolve) => (ready = resolve));
  let heard: (line: Line) => void = () => undefined;
  const line = new Promise<Line>((resolve) => (heard = resolve));

  const ada = joinChat(new SocketChannel(socket()), 'Ada', {
    line: () => undefined,
    peers: (count) => {
      if (count === 1) ready();
    },
  });
  const grace = joinChat(new SocketChannel(socket()), 'Grace', {
    line: (l) => {
      heard(l);
    },
    peers: () => undefined,
  });
  cleanup.push(ada.leave, grace.leave);
  await connected;

  ada.say('over socket.io');

  expect(await line).toEqual({ from: 'Ada', text: 'over socket.io' });
});

test('a peer whose socket drops disconnects from the others', async () => {
  const dropping = socket();
  const a = new PeerData(new SocketChannel(dropping));
  const b = new PeerData(new SocketChannel(socket()));
  cleanup.push(
    () => {
      a.close();
    },
    () => {
      b.close();
    },
  );
  const roomB = b.connect('drop');
  const toA = new Promise<Participant>((resolve) => roomB.on('participant', resolve));
  a.connect('drop');
  const participant = await toA;
  await new Promise<void>((resolve) => {
    participant.on('connected', () => {
      resolve();
    });
  });
  const gone = new Promise<void>((resolve) => {
    participant.on('disconnected', () => {
      resolve();
    });
  });

  dropping.close();

  await gone;
  expect(roomB.participants.size).toBe(0);
});

test('a peer whose socket reconnects is announced again, and meets those who join after', async () => {
  const reconnecting = socket();
  const a = new PeerData(new SocketChannel(reconnecting));
  const b = new PeerData(new SocketChannel(socket()));
  const c = new PeerData(new SocketChannel(socket()));
  cleanup.push(
    () => {
      a.close();
    },
    () => {
      b.close();
    },
    () => {
      c.close();
    },
  );
  const roomA = a.connect('reconnect');
  const toB = new Promise<Participant>((resolve) => roomA.on('participant', resolve));
  b.connect('reconnect');
  const atA = await toB;
  await new Promise<void>((resolve) => atA.on('connected', resolve));

  // The transport drops, and socket.io reconnects by itself: the server tells B that A left.
  const reconnected = new Promise<void>((resolve) => reconnecting.once('connect', resolve));
  reconnecting.io.engine.close();
  await reconnected;

  // C joins after: A hears about it only if the server knows A is in the room again.
  const meets = new Promise<Participant>((resolve) =>
    roomA.on('participant', (participant) => {
      // B reconnects to A under its old id; anyone else is C.
      if (participant.id !== atA.id) resolve(participant);
    }),
  );
  c.connect('reconnect');
  const met = await meets;
  await new Promise<void>((resolve) => met.on('connected', resolve));
});
