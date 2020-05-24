---
id: socket
title: Socket signalling channel
sidebar_label: Socket signalling channel
---

## Example

In the repository root directory you can find some simple examples. Click [here for socket signalling channel example](https://github.com/vardius/peer-data/tree/master/examples/socket-channel).

This simple project demonstrates how to setup WebRTC connection using [peer-data](https://github.com/vardius/peer-data) and socket signalling channel. 

To run this example simple clone the repository and perform the following from the root directory:

```sh
➜  examples git:(master) ✗ cd socket-channel
➜  socket-channel git:(master) ✗ yarn
yarn install v1.22.1
[1/4] 🔍  Resolving packages...
success Already up-to-date.
✨  Done in 0.13s.
➜  socket-channel git:(master) ✗ yarn start
yarn run v1.22.1
$ node server.js
Server started at port 3000
```

Then open [http://localhost:3000/](http://localhost:3000/).