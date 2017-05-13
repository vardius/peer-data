import { App } from './app';

describe('App', () => {
  it('should init', () => {
    let app = new App();

    expect(app).toBeDefined();
  });
});
