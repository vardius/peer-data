import { App } from '../App';
import { EventDispatcher } from '../EventDispatcher';

const servers = {
    iceServers: [
        { urls: ['stun:stun.1.google.com:19302'] },
    ],
};
const constraints = { ordered: true };
const dispatcher =new EventDispatcher();

const app = new App(dispatcher, servers, constraints);

test('App init', (): void => {
    expect(app).toBeDefined();
});
