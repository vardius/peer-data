import { App } from './../src/app/app';

const servers = {
  iceServers: [
    { url: "stun:stun.1.google.com:19302" }
  ]
};
const constraints = { ordered: true };
const app = new App(servers, constraints);

test('App init', () => {
  expect(app).toBeDefined();
});
