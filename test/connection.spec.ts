import { Connection } from './../src/app/Connection';

const constraints = { ordered: true };
const connection = new Connection();

test('Connection initialized', () => {
  expect(connection).toBeDefined();
});

test('Connection peers', () => {
  const key = 'test';
  const pc = { id: '', close: () => { } };

  connection.addPeer(key, pc);
  expect(connection.getPeer(key)).toBeDefined();

  const peer = connection.getPeer(key);
  expect(pc).toEqual(peer);

  connection.removePeer(key);
  expect(connection.peers[key]).toBeUndefined();
});

test('Connection channels', () => {
  const key = 'test';
  const chan = { id: '', close: () => { } };

  connection.addChannel(key, chan);
  expect(connection.getChannel(key)).toBeDefined();

  const channel = connection.getChannel(key);
  expect(chan).toEqual(channel);

  connection.removeChannel(key);
  expect(connection.channels[key]).toBeUndefined();
});
