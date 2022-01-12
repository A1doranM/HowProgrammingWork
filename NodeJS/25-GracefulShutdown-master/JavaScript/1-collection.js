"use strict";

// Пара слов о Graceful shutdown
// 1) DevOps
// 1.1) Graceful Shutdown необходим при re-deploy приложения, чтобы не потерять часть данных во время аварийной остановки приложения.
// 1.2) В зависимости от инфраструктуры приложение получит один из unix сигналов: ["SIGTERM", "SIGINT", "SIGHUP"] в качестве команды остановись.
// 1.3) Если приложение не окончит свою работу в течение 1-1.4 секунды (зависит от инфраструктуры), то оно будет убито принудительно сигналом "SIGKILL"
// 2) Node.js
// 2.1) process.exit(0) (или с любым другим аргументов) это аварийная, а не мягкая остановка
// 2.2) Graceful Shutdown в Node.js выполняется посредством закрытия всех соединений и остановки всех таймеров
// 2.3) Вместо закрытия порта, разрыва соединения или остановки таймера можно использования метод unref чтобы пометить объект второстепенным.
// 2.4) Если не происходит быстрое освобождение ресурсов, то хорошим тоном является самостоятельный вызывать аварийную остановку до того, как инфраструктура убьет процесс. Для этого подходит таймаут с process.exit(1) помеченный unref.
// 2.5) Последним шагом любой остановки является process.on("exit", (exitCode) => ...) используемый для логирования, что ваш процесс остановился и с каким кодом.
// 3) Misc
// 3.1) Для хранения соединений лучше использовать Set а не Map
// 3.2) pm2, а не самописный cluster является общепринитым методом кластеризации.
// 3.3) WebSocket или ServerSideEvents выглядели бы наглядней для демонстрации проблемы..


const http = require("http");
const connections = new Map();

const SERVER_PORT = 8000;
const LONG_RESPONSE = 60000; //

const server = http.createServer((req, res) => {
  console.log("New request");
  connections.set(res.connection, res);
  setTimeout(() => {
    res.end("Example output");
  }, LONG_RESPONSE);
});

server.on("connection", connection => {
  console.log("New connection");
  connection.on("close", () => {
    console.log("Close");
    connections.delete(connection);
  });
});

server.listen(SERVER_PORT);

const showConnections = () => {
  console.log("Connection:", [...connections.values()].length);
  for (const connection of connections.keys()) {
    const { remoteAddress, remotePort } = connection;
    console.log(`  ${remoteAddress}:${remotePort}`);
  }
};

const closeConnections = () => {
  for (const [connection, res] of connections.entries()) {
    connections.delete(connection);
    res.end("Server stopped");
    connection.destroy();
  }
};

const freeResources = callback => {
  console.log("Free resources");
  callback();
};

const gracefulShutdown = callback => {
  server.close(error => {
    if (error) {
      console.log(error);
      process.exit(1);
    }
    freeResources(callback);
  });
  closeConnections();
};

process.on("SIGINT", () => {
  console.log();
  console.log("Graceful shutdown");
  showConnections();
  gracefulShutdown(() => {
    showConnections();
    console.log("Bye");
    process.exit(0);
  });
});
