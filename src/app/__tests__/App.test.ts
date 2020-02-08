import { App } from '../App';

const servers = {
    iceServers: [
        { urls: ['stun:stun.1.google.com:19302'] },
    ],
};
const constraints = { ordered: true };
const app = new App(servers, constraints);

test('App init', (): void => {
    expect(app).toBeDefined();
});
