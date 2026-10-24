# Contributing

Thanks for helping improve **peer-data**. By contributing, you agree to abide by the [code of conduct](CODE_OF_CONDUCT.md).

## Issues and questions

Search the [issue tracker](https://github.com/vardius/peer-data/issues) first; if nothing matches, open an issue.
Bugs, ideas and usage questions are all welcome. For a bug, include the browser, the signaling you use, and what
each peer did.

## Development

You need Node.js 24 or newer.

```sh
git clone https://github.com/vardius/peer-data.git
cd peer-data
npm ci
npx playwright install chromium firefox webkit
npm test
```

Before sending a pull request, run what CI runs:

```sh
npm run typecheck
npx -y -p typescript@7.0.2 tsc --noEmit
npm run lint
npm run format:check
npm test
npm run build
npm pack --dry-run
```

`npm run format` fixes formatting.

### Layout

- `src/` holds the library: `PeerData`, `Room`, `Participant`, the signaling types, `SocketChannel` and
  `BroadcastChannelSignaling`.
- `test/` holds the tests. They run real peer connections in Chromium, Firefox and WebKit, through an in-memory
  signaling hub (`test/hub.ts`) or a socket.io server started for the run, and need no network.
  To run one browser: `npx vitest run --project 'browser (chromium)'`.
- `examples/` holds runnable examples, whose logic has tests. The website shows them, so keep them short.
  `npm run examples` serves them, with the socket.io signaling server, at http://localhost:5173.
- `website/` is the documentation site.

### Website

```sh
cd website
npm ci
npm run dev
```

## Pull requests

- For a large change, open an issue first so we can agree on the approach.
- Branch from `master`, keep the change focused, and add a test that fails without it.
