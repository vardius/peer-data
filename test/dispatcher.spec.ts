import { EventDispatcher, HANDLERS } from './../src/app/EventDispatcher';

let works = 0;

test('EventDispatcher is defined', () => {
  expect(EventDispatcher).toBeDefined();
});

test('EventDispatcher register', () => {
  const key = 'TEST';
  EventDispatcher.register(key, () => works++);

  expect(HANDLERS[key]).toBeDefined();
});

test('EventDispatcher dispatch', () => {
  EventDispatcher.dispatch('TEST');

  expect(works).toEqual(1);
});
