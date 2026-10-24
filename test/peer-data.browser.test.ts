import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  BroadcastChannelSignaling,
  PeerData,
  type Participant,
  type PeerDataOptions,
  type Room,
  type Signaling,
  type SignalingEvent,
} from 'peer-data';
import { Hub } from './hub.js';

const open: PeerData[] = [];

afterEach(() => {
  vi.unstubAllGlobals();
  for (const peer of open.splice(0)) {
    try {
      peer.close();
    } catch {
      // A test's signaling that throws on purpose.
    }
  }
});

function peer(signaling: Signaling, options?: PeerDataOptions): PeerData {
  const created = new PeerData(signaling, options);
  open.push(created);
  return created;
}

const nextParticipant = (room: Room): Promise<Participant> => new Promise((resolve) => room.on('participant', resolve));

const connected = (participant: Participant): Promise<void> =>
  new Promise((resolve) => {
    participant.on('connected', () => {
      resolve();
    });
  });

const disconnected = (participant: Participant): Promise<void> =>
  new Promise((resolve) => {
    participant.on('disconnected', () => {
      resolve();
    });
  });

function messages(participant: Participant, count: number): Promise<(string | ArrayBuffer)[]> {
  const received: (string | ArrayBuffer)[] = [];
  return new Promise((resolve) =>
    participant.on('message', (data) => {
      received.push(data);
      if (received.length === count) resolve(received);
    }),
  );
}

/** Resolves once count participants of room have connected. */
function connectedTo(room: Room, count: number): Promise<void> {
  return new Promise((resolve) => {
    let open = 0;
    room.on('participant', (participant) => {
      participant.on('connected', () => {
        if (++open === count) resolve();
      });
    });
  });
}

/** The first message any participant of room sends. */
const firstMessage = (room: Room): Promise<string | ArrayBuffer> =>
  new Promise((resolve) => room.on('participant', (participant) => participant.on('message', resolve)));

const track = (participant: Participant): Promise<RTCTrackEvent> =>
  new Promise((resolve) => participant.on('track', resolve));

/** A video track that needs no camera. */
function canvasStream(): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  canvas.getContext('2d')?.fillRect(0, 0, 32, 32);
  return canvas.captureStream();
}

/** Signaling that only goes where a test sends it: deliver hands this peer a message, as if from the server. */
function fakeSignaling(send: (event: SignalingEvent) => void = () => undefined) {
  let listener: (message: unknown) => void = () => undefined;
  let listening = false;
  const signaling: Signaling = {
    send,
    subscribe: (subscriber) => {
      listener = subscriber;
      listening = true;
      return () => {
        listening = false;
      };
    },
  };
  return {
    signaling,
    deliver: (message: unknown) => {
      listener(message);
    },
    get listening() {
      return listening;
    },
  };
}

const connectFrom = (id: string, room = 'room'): SignalingEvent => ({
  type: 'CONNECT',
  room: { id: room },
  caller: { id },
  callee: null,
  payload: null,
});

/** Two peers in one room, each with its participant for the other. */
async function pair(hub = new Hub(), options: { streamA?: MediaStream; streamB?: MediaStream } = {}) {
  const roomA = peer(hub.connect()).connect('room', options.streamA);
  const toB = nextParticipant(roomA);
  const roomB = peer(hub.connect()).connect('room', options.streamB);
  const toA = nextParticipant(roomB);
  const [b, a] = await Promise.all([toB, toA]);
  return { roomA, roomB, a, b };
}

describe('data', () => {
  test('flows both ways between peers that share no media', async () => {
    const { a, b } = await pair();
    await Promise.all([connected(a), connected(b)]);

    // a is B's participant for peer A, and b is A's for peer B: a.send goes from B to A.
    const atA = messages(b, 1);
    const atB = messages(a, 1);
    a.send('to a');
    b.send('to b');

    expect(await atA).toEqual(['to a']);
    expect(await atB).toEqual(['to b']);
  });

  test('sent before the channel opens arrives once it does, in order', async () => {
    const { a, b } = await pair();
    const atA = messages(a, 3);
    expect(b.channel.readyState).toBe('connecting');
    b.send('one').send('two').send('three');

    expect(await atA).toEqual(['one', 'two', 'three']);
  });

  test('binary data arrives as an ArrayBuffer', async () => {
    const { a, b } = await pair();
    const atA = messages(a, 1);
    b.send(new Uint8Array([1, 2, 3]));

    const [data] = await atA;
    expect(data).toBeInstanceOf(ArrayBuffer);
    expect([...new Uint8Array(data as ArrayBuffer)]).toEqual([1, 2, 3]);
  });

  test('room.send reaches every participant', async () => {
    const hub = new Hub();
    const roomA = peer(hub.connect()).connect('room');
    const ready = connectedTo(roomA, 2);
    const received = [peer(hub.connect()).connect('room'), peer(hub.connect()).connect('room')].map(firstMessage);
    await ready;

    roomA.send('hello');

    expect(await Promise.all(received)).toEqual(['hello', 'hello']);
  });

  test('binary data sent before the channel opens arrives as it was when sent', async () => {
    const { a, b } = await pair();
    const atA = messages(a, 3);
    const view = new Uint8Array([1]);
    const buffer = new Uint8Array([7]).buffer;

    b.send(view);
    view[0] = 2;
    b.send(view);
    b.send(buffer);
    // Transferring detaches the buffer: what was queued must not depend on it.
    structuredClone(buffer, { transfer: [buffer] });

    const received = await atA;
    expect(received.map((data) => [...new Uint8Array(data as ArrayBuffer)])).toEqual([[1], [2], [7]]);
  });

  test('a Blob is refused, since it could arrive out of order', async () => {
    const { b } = await pair();
    expect(() => b.send(new Blob(['x']) as unknown as ArrayBuffer)).toThrow(TypeError);
  });

  test('send throws once the participant is disconnected', async () => {
    const { b } = await pair();
    b.close();

    expect(() => b.send('late')).toThrow('disconnected');
  });

  test('send throws while the participant is disconnecting', async () => {
    const { a, b } = await pair();
    await Promise.all([connected(a), connected(b)]);
    b.channel.close();

    expect(() => b.send('late')).toThrow('disconnected');
  });

  test('room.send reaches the others when one participant cannot take it', async () => {
    const hub = new Hub();
    const roomA = peer(hub.connect()).connect('room');
    const ready = connectedTo(roomA, 2);
    const others = [peer(hub.connect()).connect('room'), peer(hub.connect()).connect('room')];
    const received = others.map(firstMessage);
    await ready;
    // The first participant room.send comes to.
    const [closing] = roomA.participants.values();
    closing?.channel.close();

    expect(() => roomA.send('hello')).toThrow('disconnected');
    // Only the other peer can hear it.
    expect(await Promise.race(received)).toBe('hello');
  });
});

describe('media', () => {
  test('the room stream reaches the participant', async () => {
    const stream = canvasStream();
    const hub = new Hub();
    const roomA = peer(hub.connect()).connect('room', stream);
    const toB = nextParticipant(roomA);
    const roomB = peer(hub.connect()).connect('room');
    const a = await nextParticipant(roomB);
    await toB;

    const { track: received } = await track(a);
    expect(received.kind).toBe('video');
  });

  test('peers that both join with a stream connect', async () => {
    const { a, b } = await pair(new Hub(), { streamA: canvasStream(), streamB: canvasStream() });

    await Promise.all([track(a), track(b), connected(a), connected(b)]);
  });

  test('a stream added after connecting renegotiates', async () => {
    const { a, b } = await pair();
    await Promise.all([connected(a), connected(b)]);
    const atA = track(a);
    b.addStream(canvasStream());

    expect((await atA).track.kind).toBe('video');
  });

  test('offers that cross are resolved', async () => {
    const { a, b } = await pair();
    await Promise.all([connected(a), connected(b)]);
    const atA = track(a);
    const atB = track(b);
    a.addStream(canvasStream());
    b.addStream(canvasStream());

    await Promise.all([atA, atB]);
    // The data channel survived both renegotiations.
    const atAAgain = messages(a, 1);
    b.send('still here');
    expect(await atAAgain).toEqual(['still here']);
  });

  test('offers that cross are resolved through a server that replaces caller ids', async () => {
    const { a, b } = await pair(new Hub({ rewriteIds: true }));
    await Promise.all([connected(a), connected(b)]);
    const atA = track(a);
    const atB = track(b);
    a.addStream(canvasStream());
    b.addStream(canvasStream());

    await Promise.all([atA, atB]);
  });
});

describe('rooms', () => {
  test('peers that join at the same moment connect', async () => {
    const name = `same-moment-${String(Math.random())}`;
    const signals = [new BroadcastChannelSignaling(name), new BroadcastChannelSignaling(name)] as const;
    // Both join before either hears the other: each receives the other's CONNECT.
    const rooms = signals.map((signaling) => peer(signaling).connect('room'));
    const [b, a] = await Promise.all(rooms.map(nextParticipant));
    if (!a || !b) throw new Error('missing participant');
    await Promise.all([connected(a), connected(b)]);

    const atA = messages(a, 1);
    b.send('hi');
    expect(await atA).toEqual(['hi']);
    for (const signaling of signals) signaling.close();
  });

  test('a peer that leaves disconnects from the others', async () => {
    const { roomA, roomB, a } = await pair();
    await connected(a);
    const gone = disconnected(a);

    roomA.disconnect();

    await gone;
    expect(roomB.participants.size).toBe(0);
    expect(roomA.participants.size).toBe(0);
  });

  test('closing a participant disconnects both sides', async () => {
    const { roomB, a, b } = await pair();
    await Promise.all([connected(a), connected(b)]);
    const gone = disconnected(a);

    b.close();

    await gone;
    expect(roomB.participants.size).toBe(0);
  });

  test('a participant whose channel never opens is closed after connectTimeout', async () => {
    const hub = new Hub();
    const roomA = peer(hub.connect(), { connectTimeout: 300 }).connect('room');
    const toB = nextParticipant(roomA);
    // B turns every participant away at once, before answering.
    peer(hub.connect())
      .connect('room')
      .on('participant', (participant) => {
        participant.close();
      });
    const b = await toB;

    await disconnected(b);
    expect(roomA.participants.size).toBe(0);
  });

  test('a peer that leaves is disconnected at once, while its connection is still up', async () => {
    const hub = new Hub();
    const signalingA = hub.connect();
    const roomA = peer(signalingA).connect('room');
    const toB = nextParticipant(roomA);
    const roomB = peer(hub.connect()).connect('room');
    const a = await nextParticipant(roomB);
    await Promise.all([connected(a), toB.then(connected)]);
    const gone = disconnected(a);

    // Only the DISCONNECT tells B: A's side of the connection stays open.
    signalingA.send({ type: 'DISCONNECT', room: { id: 'room' }, caller: { id: a.id }, callee: null, payload: null });

    await gone;
    expect(roomB.participants.size).toBe(0);
  });

  test('a CONNECT echoed back to this peer is ignored', () => {
    const sent: SignalingEvent[] = [];
    const fake = fakeSignaling((event) => sent.push(event));
    const room = peer(fake.signaling).connect('room');
    const participants: Participant[] = [];
    room.on('participant', (participant) => participants.push(participant));

    fake.deliver(structuredClone(sent[0]));

    expect(participants).toEqual([]);
  });

  test('a CONNECT from a participant already here replaces it', async () => {
    const fake = fakeSignaling();
    const room = peer(fake.signaling).connect('room');
    const participants: Participant[] = [];
    room.on('participant', (participant) => participants.push(participant));
    fake.deliver(connectFrom('x'));
    const [old] = participants;
    const gone = old ? disconnected(old) : Promise.reject(new Error('no participant'));

    fake.deliver(connectFrom('x'));

    await gone;
    expect(participants).toHaveLength(2);
    expect(room.participants.get('x')).toBe(participants[1]);
  });

  test('connect returns the room until it is left', () => {
    const peerData = peer(new Hub().connect());
    const room = peerData.connect('room');

    expect(peerData.connect('room')).toBe(room);
    room.disconnect();
    expect(peerData.connect('room')).not.toBe(room);
  });

  test('connect rejects an empty room id, and any room after close', () => {
    const peerData = peer(new Hub().connect());

    expect(() => peerData.connect('')).toThrow(TypeError);
    peerData.close();
    expect(() => peerData.connect('room')).toThrow('after close');
  });

  test('close leaves every room and stops listening', () => {
    const sent: SignalingEvent[] = [];
    let listening = 0;
    const peerData = peer({
      send: (event) => sent.push(event),
      subscribe: () => {
        listening++;
        return () => listening--;
      },
    });
    peerData.connect('one');
    peerData.connect('two');

    peerData.close();

    expect(sent.map((event) => `${event.type} ${event.room.id}`)).toEqual([
      'CONNECT one',
      'CONNECT two',
      'DISCONNECT one',
      'DISCONNECT two',
    ]);
    expect(listening).toBe(0);
  });
});

describe('signaling errors', () => {
  test('connect tries again after signaling threw', () => {
    let down = true;
    const sent: SignalingEvent[] = [];
    const peerData = peer(
      fakeSignaling((event) => {
        if (down) throw new Error('not connected');
        sent.push(event);
      }).signaling,
    );

    expect(() => peerData.connect('room')).toThrow('not connected');
    down = false;
    peerData.connect('room');

    expect(sent.map((event) => event.type)).toEqual(['CONNECT']);
  });

  test('disconnect leaves the room even when signaling throws', async () => {
    let down = false;
    const fake = fakeSignaling(() => {
      if (down) throw new Error('not connected');
    });
    const peerData = peer(fake.signaling);
    const room = peerData.connect('room');
    fake.deliver(connectFrom('x'));
    const participant = room.participants.get('x');
    const gone = participant ? disconnected(participant) : Promise.reject(new Error('no participant'));

    down = true;
    expect(() => {
      room.disconnect();
    }).toThrow('not connected');

    await gone;
    expect(room.participants.size).toBe(0);
    down = false;
    expect(peerData.connect('room')).not.toBe(room);
  });

  test('close leaves every room and stops listening even when signaling throws', () => {
    let down = false;
    const sent: string[] = [];
    const fake = fakeSignaling((event) => {
      if (down) throw new Error('not connected');
      sent.push(`${event.type} ${event.room.id}`);
    });
    const peerData = peer(fake.signaling);
    const one = peerData.connect('one');
    peerData.connect('two');

    down = true;
    expect(() => {
      peerData.close();
    }).toThrow('not connected');

    expect(fake.listening).toBe(false);
    down = false;
    expect(() => peerData.connect('one')).toThrow('after close');
    expect(one.participants.size).toBe(0);
  });

  test('a participant that cannot be set up closes the connection it made', async () => {
    const made: RTCPeerConnection[] = [];
    const Native = RTCPeerConnection;
    vi.stubGlobal(
      'RTCPeerConnection',
      class extends Native {
        constructor(configuration?: RTCConfiguration) {
          super(configuration);
          made.push(this);
        }
      },
    );
    const fake = fakeSignaling();
    // The browser rejects a channel with both limits after the connection exists.
    const room = peer(fake.signaling, { channel: { maxRetransmits: 0, maxPacketLifeTime: 100 } }).connect('room');
    const error = new Promise<Error>((resolve) => room.on('error', resolve));

    fake.deliver(connectFrom('x'));

    expect(await error).toBeInstanceOf(TypeError);
    expect(made.map((connection) => connection.signalingState)).toEqual(['closed']);
  });

  test('an ICE candidate signaling throws on is reported on the participant', async () => {
    const hub = new Hub();
    const real = hub.connect();
    const roomA = peer({
      send: (event) => {
        if (event.type === 'CANDIDATE') throw new Error('candidate lost');
        real.send(event);
      },
      subscribe: (listener) => real.subscribe(listener),
    }).connect('room');
    const toB = nextParticipant(roomA);
    peer(hub.connect()).connect('room');
    const b = await toB;

    const error = await new Promise<Error>((resolve) => b.on('error', resolve));
    expect(error.message).toBe('candidate lost');
  });
});

describe('signaling', () => {
  test('malformed messages are ignored', () => {
    let deliver: (message: unknown) => void = () => undefined;
    const room = peer({
      send: () => undefined,
      subscribe: (listener) => {
        deliver = listener;
        return () => undefined;
      },
    }).connect('room');
    const participants: Participant[] = [];
    room.on('participant', (participant) => participants.push(participant));

    for (const message of [
      null,
      'CONNECT',
      { type: 'CONNECT' },
      { type: 'CONNECT', room: { id: 'room' } },
      { type: 'CONNECT', room: { id: 'room' }, caller: { id: 7 } },
      { type: 'OFFER', room: { id: 'room' }, caller: { id: 'x' }, callee: { id: 'y' } },
      { type: 'CANDIDATE', room: { id: 'room' }, caller: { id: 'x' }, callee: null, payload: {} },
      { type: 'HELLO', room: { id: 'room' }, caller: { id: 'x' } },
    ]) {
      deliver(message);
    }
    expect(participants).toEqual([]);

    deliver({ type: 'CONNECT', room: { id: 'room' }, caller: { id: 'x' } });
    expect(participants.map((p) => p.id)).toEqual(['x']);
  });

  test('a failed negotiation is reported on the participant', async () => {
    const hub = new Hub();
    const mallory = hub.connect();
    // Answers every newcomer with an offer that can't be applied.
    mallory.subscribe((message) => {
      const event = message as SignalingEvent;
      if (event.type !== 'CONNECT') return;
      mallory.send({
        type: 'OFFER',
        room: event.room,
        caller: { id: 'mallory' },
        callee: event.caller,
        payload: { type: 'offer', sdp: 'not sdp' },
      });
    });
    mallory.send({ type: 'CONNECT', room: { id: 'room' }, caller: { id: 'mallory' }, callee: null, payload: null });

    const room = peer(hub.connect()).connect('room');
    const participant = await nextParticipant(room);
    const error = await new Promise<Error>((resolve) => participant.on('error', resolve));

    expect(participant.id).toBe('mallory');
    expect(error).toBeInstanceOf(Error);
  });

  test('a participant that cannot be set up is reported on the room', async () => {
    const hub = new Hub();
    const room = peer(hub.connect(), { configuration: { iceServers: [{ urls: 'not a url' }] } }).connect('room');
    const error = new Promise<Error>((resolve) => room.on('error', resolve));

    peer(hub.connect()).connect('room');

    expect(await error).toBeInstanceOf(Error);
    expect(room.participants.size).toBe(0);
  });

  test('BroadcastChannelSignaling keeps offers between the peers they are for', async () => {
    // With three peers on one channel, every offer also reaches a peer it isn't for.
    const name = `three-${String(Math.random())}`;
    const signals = [0, 1, 2].map(() => new BroadcastChannelSignaling(name));
    const [first, ...others] = signals.map((signaling) => peer(signaling).connect('room'));
    if (!first) throw new Error('no room');
    const ready = [first, ...others].map((room) => connectedTo(room, 2));
    const received = others.map(firstMessage);
    await Promise.all(ready);

    first.send('ping');

    expect(await Promise.all(received)).toEqual(['ping', 'ping']);
    for (const signaling of signals) signaling.close();
  });
});
