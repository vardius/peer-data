---
id: local
title: Local connection
sidebar_label: Local connection
---

## Example

In the repository root directory you can find some simple examples. Click [here for local connection example](https://github.com/vardius/peer-data/tree/master/examples/local-connection).

This simple project demonstrates how to setup WebRTC connection using [peer-data](https://github.com/vardius/peer-data) and custom signalling channel instead of builtin [SocketChannel](https://github.com/vardius/peer-data/blob/master/src/app/SocketChannel.ts). 

To run this example simple clone the repository and perform the following from the root directory:

```sh
➜  examples git:(master) ✗ cd local-connection
➜  local-connection git:(master) ✗ yarn
yarn install v1.22.1
[1/4] 🔍  Resolving packages...
success Already up-to-date.
✨  Done in 0.13s.
➜  local-connection git:(master) ✗ yarn start
yarn run v1.22.1
$ node server.js
Server started at port 3000
```

Then open [http://localhost:3000/](http://localhost:3000/).
