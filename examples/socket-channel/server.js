const express = require("express");
const fspath = require("path");
const http = require("http");
const fs = require("fs");
const PeerDataServer = require("peer-data-server");

const port = process.env.PORT || 3000;
const index = fspath.join(__dirname, "index.html");
const main = fspath.join(__dirname, "main.js");

const app = express();
app.get("/main.js", (req, res) => res.sendFile(main));
app.get("/favicon.ico", (req, res) => res.sendStatus(404));
app.get("*", (req, res) => res.sendFile(index));

const appendPeerDataServer = PeerDataServer.default || PeerDataServer;
const server = http.createServer(app);

appendPeerDataServer(server);

server.listen(port, () => console.log(`Server started at port ${port}`));
