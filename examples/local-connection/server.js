const express = require("express");
const fspath = require("path");
const http = require("http");
const fs = require("fs");

const port = process.env.PORT || 3000;

const app = express();
app.get("/local.js", (req, res) => res.sendFile(fspath.join(__dirname, "local.js")));
app.get("/remote.js", (req, res) => res.sendFile(fspath.join(__dirname, "remote.js")));
app.get("/favicon.ico", (req, res) => res.sendStatus(404));
app.get("*", (req, res) => res.sendFile(fspath.join(__dirname, "index.html")));

const server = http.createServer(app);

server.listen(port, () => console.log(`Server started at port ${port}`));
