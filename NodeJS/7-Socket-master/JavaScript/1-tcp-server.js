"use strict";
// TCP разделяет данные на пакеты, так как ему удобнее.
const net = require("net");

const onData = (data, ...args) => {
  console.log({args});
  console.log("📨:", data);
};

const server = net.createServer((socket) => {
  console.dir(socket.address());
  socket.setNoDelay(true); // Флаг говорит о том сразу ли нам посылать пакеты которые нам приходят, или использовать алгоритм Нейджела для буферизации приходящих данных и только затем отсылать.
  socket.write("💗");
  socket.on("data", onData);
  socket.on("error", (err) => {
    console.log("Socket error", err);
  });
}).listen(2000);

server.on("error", (err) => {
  console.log("Server error", err);
});
