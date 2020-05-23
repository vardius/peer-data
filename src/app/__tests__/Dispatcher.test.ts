import { EventDispatcher } from '../EventDispatcher';

test('EventDispatcher is defined', (): void => {
    expect(EventDispatcher).toBeDefined();
});

test('EventDispatcher should dispatch global event', (): void => {
    let works = 0;
    const key = 'TEST';

    const dispatcher = new EventDispatcher();

    dispatcher.register(key, (): number => works++);
    dispatcher.dispatch(key);

    expect(works).toEqual(1);
});

test('EventDispatcher should dispatch event', (): void => {
    let works = 0;
    const key = 'TEST';
    const dispatcher = new EventDispatcher();

    dispatcher.register(key, (): number => works++);
    dispatcher.dispatch(key);

    expect(works).toEqual(1);
});

test('EventDispatcher should handle different events', (): void => {
    let works = 0;
    const key = 'TEST';
    const key2 = 'OTHER';
    const dispatcher = new EventDispatcher();

    dispatcher.register(key, (): number => works++);
    dispatcher.register(key2, (): number => works--);
    dispatcher.dispatch(key);

    expect(works).toEqual(1);

    dispatcher.dispatch(key2);

    expect(works).toEqual(0);
});
