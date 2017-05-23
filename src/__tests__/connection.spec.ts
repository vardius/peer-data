import { Connection } from './../app/connection/connection';
import * from '@types/webrtc';

const servers = {
  iceServers: [
    { url: "stun:stun.1.google.com:19302" }
  ]
};
const constraints = { ordered: true };
const connection = new Connection(servers, constraints);

test('Connection initialized', () => {
  expect(connection).toBeDefined();
  expect(connection.servers).toEqual(servers);
  expect(connection.dataConstraints).toEqual(constraints);
});

test('Connection servers', () => {
  expect(connection.servers).toEqual(servers);
});

test('Connection constraints', () => {
  expect(connection.dataConstraints).toEqual(constraints);
});

test('Connection peers', () => {
  const pc = {id: 'test-peer', close: function(){}};

  connection.addPeer('test', pc);
  expect(connection.peers['test']).toBeDefined();

  const peer = connection.getPeer('test');
  expect(pc).toEqual(peer);

  connection.removePeer('test');
  expect(connection.peers['test']).toBeUndefined();
});

test('Connection channels', () => {
  const chan = {id: 'test-channel', close: function(){}};

  connection.addChannel('test', chan);
  expect(connection.channels['test']).toBeDefined();

  const channel = connection.getChannel('test');
  expect(chan).toEqual(channel);

  connection.removeChannel('test');
  expect(connection.channels['test']).toBeUndefined();
});
