"use strict";

const dgram = require("dgram");

// UDP Не разделяет данные на пакеты, и отсылает их так как есть. К тому же не требует подтверждения того
// что мы подключились к сокету, поэтому можно просто слать данные на какой-то аддресс даже если их там не слушают.
const server = dgram.createSocket("udp4");

server.on("message", (msg, rinfo) => {
  console.dir({ msg, rinfo });
});

server.bind(3000);
