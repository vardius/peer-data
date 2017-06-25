import { Connection } from './../src/app/Connection';

const constraints = { ordered: true };
const connection = new Connection();

test('Connection initialized', () => {
  expect(connection).toBeDefined();
});

test('Connection peers', () => {
  const key = 'test';
  const pc = new RTCPeerConnection({});

  connection.addPeer(key, pc);
  expect(connection.peers[key]).toBeDefined();

  const peer = connection.getPeer(key);
  expect(pc).toEqual(peer);

  connection.removePeer(key);
  expect(connection.peers[key]).toBeUndefined();
});

test('Connection channels', () => {
  const key = 'test';
  const chan = {
    label: 'test-channel',
    close: () => { },
    ordered: true,
    maxPacketLifeTime: 0,
    maxRetransmits: 0,
    protocol: '',
    negotiated: false,
    id: 1,
    readyState: 'connecting',
    bufferedAmount: 0,
    bufferedAmountLowThreshold: 0,
    binaryType: 'arraybuffer',
  };

  connection.addChannel(key, chan);
  expect(connection.channels[key]).toBeDefined();

  const channel = connection.getChannel(key);
  expect(chan).toEqual(channel);

  connection.removeChannel(key);
  expect(connection.channels[key]).toBeUndefined();
});
