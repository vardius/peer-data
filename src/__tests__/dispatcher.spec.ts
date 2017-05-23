import { EventDispatcher, HANDLERS } from './../app/dispatcher/dispatcher';

let works = 0;

test('EventDispatcher is defined', () => {
  expect(EventDispatcher).toBeDefined();
});

test('EventDispatcher register', () => {
  EventDispatcher.register('TEST', () => works++);

  expect(HANDLERS['TEST']).toBeDefined();
});

test('EventDispatcher dispatch', () => {
  EventDispatcher.dispatch('TEST');

  expect(works).toEqual(1);
});
