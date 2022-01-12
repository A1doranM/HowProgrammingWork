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
const connections = new Map(); // Помещаем все конекшины в коллекцию чтобы потом отдавать им команду о том что сервер стопнулся.
                               // Ключ это сокет, а значение это респонс который нам нужен для того чтобы можно было работать с респонсом от конкретного сокета.

const SERVER_PORT = 8000;
const LONG_RESPONSE = 60000; // Константа для длинных запросов.

const server = http.createServer((req, res) => {
  console.log("New request");
  connections.set(res.connection, res); // Сохраняем сокет в коллекцию.
  setTimeout(() => {
    res.end("Example output");
  }, LONG_RESPONSE); // Ждем минуту и после этого отдаем строку в браузер. Это на до просто для демонстрации.
                     // Это надо для того чтобы потом при демонстрации во всех долгообрабатываемых запросах получить 503 ошибку.
});

server.on("connection", connection => { // connection ссылается на сокет.
  console.log("New connection");
  connection.on("close", () => { // Навешиваем событие на окончание связи.
    console.log("Close");
    connections.delete(connection); // Удаляем текущее соединение.
  });
});

server.listen(SERVER_PORT);

const showConnections = () => { // Показывет что содержится в коллекции конекшинс.
  console.log("Connection:", [...connections.values()].length);
  for (const connection of connections.keys()) {
    const { remoteAddress, remotePort } = connection;
    console.log(`  ${remoteAddress}:${remotePort}`);
  }
};

const closeConnections = () => { // Закрываем соединение
  for (const [connection, res] of connections.entries()) { // проходя по всем конекшинам и
    connections.delete(connection); // удаляя их из коннекции.
    res.end("Server stopped");
    connection.destroy(); // Закрываем сокет в конце.
  }
};

// Тут мы как будто освобождаем ресурсы которые заняты в конекшинах
const freeResources = callback => { // например разные соединения к БД и т.д.
  console.log("Free resources");
  callback(); // И вызываем коллбэк.
};

const gracefulShutdown = callback => {
  server.close(error => { // Для начала закрываем сервер.
                                  // Но он не закрывается, а просто перестает принимать конекшины
                                  // и ждет пока все остальные конекшины не закроются.
    if (error) { // Если произошла ошибка
      console.log(error);
      process.exit(1); // аварийно прерываем работу.
    }
    freeResources(callback); // Коллбек который вополнится когда все конекшины закроются.
  });
  closeConnections(); // Вот эта функция выполнится сразу после вызова server.close().
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
