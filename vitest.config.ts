import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { 'peer-data': fileURLToPath(new URL('src/index.ts', import.meta.url)) },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          include: ['{test,examples}/**/*.node.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['{test,examples}/**/*.browser.test.ts'],
          // A signaling server for the tests that go through socket.io.
          globalSetup: ['test/signaling-server.ts'],
          testTimeout: 15_000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              { browser: 'chromium' },
              {
                browser: 'firefox',
                // Firefox hides host addresses behind mDNS names, which CI machines may not resolve, and skips
                // loopback: let the peers in one browser connect over plain addresses, loopback included.
                provider: playwright({
                  launchOptions: {
                    firefoxUserPrefs: {
                      'media.peerconnection.ice.obfuscate_host_addresses': false,
                      'media.peerconnection.ice.loopback': true,
                    },
                  },
                }),
              },
              { browser: 'webkit' },
            ],
          },
        },
      },
    ],
  },
});
