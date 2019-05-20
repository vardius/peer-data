import { EventDispatcher } from '../EventDispatcher';

test('EventDispatcher is defined', () => {
  expect(EventDispatcher).toBeDefined();
  expect(EventDispatcher.getInstance()).toBeDefined();
  expect(EventDispatcher.getInstance()).toEqual(EventDispatcher.getInstance());
});

test('EventDispatcher should dispatch global event', () => {
  let works = 0;
  const key = 'TEST';

  EventDispatcher.getInstance().register(key, () => works++);
  EventDispatcher.getInstance().dispatch(key);

  expect(works).toEqual(1);
});

test('EventDispatcher should dispatch event', () => {
  let works = 0;
  const key = 'TEST';
  const dispatcher = new EventDispatcher();

  dispatcher.register(key, () => works++);
  dispatcher.dispatch(key);

  expect(works).toEqual(1);
});

test('EventDispatcher should handle different events', () => {
  let works = 0;
  const key = 'TEST';
  const key2 = 'OTHER';
  const dispatcher = new EventDispatcher();

  dispatcher.register(key, () => works++);
  dispatcher.register(key2, () => works--);
  dispatcher.dispatch(key);

  expect(works).toEqual(1);

  dispatcher.dispatch(key2);

  expect(works).toEqual(0);
});
