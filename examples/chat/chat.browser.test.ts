import { afterEach, expect, test } from 'vitest';
import { BroadcastChannelSignaling } from 'peer-data';
import { joinChat, type Line } from './chat.js';

const left: (() => void)[] = [];

afterEach(() => {
  for (const leave of left.splice(0)) leave();
});

test('a line reaches everyone else in the chat', async () => {
  const name = `chat-${String(Math.random())}`;
  const heard: Line[] = [];
  let ready: () => void = () => undefined;
  const bothConnected = new Promise<void>((resolve) => (ready = resolve));
  let lineArrived: () => void = () => undefined;
  const arrived = new Promise<void>((resolve) => (lineArrived = resolve));

  const ada = joinChat(new BroadcastChannelSignaling(name), 'Ada', {
    line: () => undefined,
    peers: (count) => {
      if (count === 1) ready();
    },
  });
  const grace = joinChat(new BroadcastChannelSignaling(name), 'Grace', {
    line: (line) => {
      heard.push(line);
      lineArrived();
    },
    peers: () => undefined,
  });
  left.push(ada.leave, grace.leave);
  await bothConnected;

  ada.say('hello');
  await arrived;

  expect(heard).toEqual([{ from: 'Ada', text: 'hello' }]);
});

test('the peer count falls when someone leaves', async () => {
  const name = `chat-${String(Math.random())}`;
  const counts: number[] = [];
  let changed: () => void = () => undefined;

  const ada = joinChat(new BroadcastChannelSignaling(name), 'Ada', {
    line: () => undefined,
    peers: (count) => {
      counts.push(count);
      changed();
    },
  });
  const grace = joinChat(new BroadcastChannelSignaling(name), 'Grace', {
    line: () => undefined,
    peers: () => undefined,
  });
  left.push(ada.leave);

  await new Promise<void>((resolve) => (changed = resolve));
  grace.leave();
  await new Promise<void>((resolve) => (changed = resolve));

  expect(counts).toEqual([1, 0]);
});
