import { EventDispatcher } from './../src/app/EventDispatcher';

test('EventDispatcher is defined', () => {
  expect(EventDispatcher).toBeDefined();
  expect(EventDispatcher.getInstance()).toBeDefined();
  expect(EventDispatcher.getInstance()).toEqual(EventDispatcher.getInstance());
});

test('EventDispatcher dispatch', () => {
  let works = 0;
  const key = 'TEST';
  EventDispatcher.getInstance().register(key, () => works++);
  EventDispatcher.getInstance().dispatch(key);

  expect(works).toEqual(1);
});
