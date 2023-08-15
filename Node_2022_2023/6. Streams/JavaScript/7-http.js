"use strict";

// Отсылаем данные с сервера на фронт. Предварительно архивировав их

const fs = require("node:fs");
const zlib = require("node:zlib");
const http = require("node:http");

const readable = fs.createReadStream("index.html");
const gzip = zlib.createGzip();

const buffers = [];
let buffer = null;

gzip.on("data", (buffer) => {
  buffers.push(buffer);
});

gzip.on("end", () => {
  buffer = Buffer.concat(buffers);
});

// Пропускаем считанные данные через стрим для архивирования.
readable.pipe(gzip);

const server = http.createServer((request, response) => {
  console.log(request.url);
  response.writeHead(200, { "Content-Encoding": "gzip" });
  response.end(buffer);
});

server.listen(8000);
