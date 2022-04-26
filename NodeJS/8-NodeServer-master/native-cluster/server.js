"use strict";

// Разбиваем сервер на кластеры
const http = require("http");
const cluster = require("cluster");
const os = require("os");

const PORT = 2000;

const user = { name: "jura", age: 22 };
const pid = process.pid;

const routing = {
  "/": "welcome to homepage",
  "/user": user,
  "/user/name": () => user.name,
  "/user/age": () => user.age,
};

const types = {
  object: JSON.stringify,
  string: s => s,
  number: n => n.toString(),
  undefined: () => "not found",
  function: (fn, par, client) => JSON.stringify(fn(client, par)),
};

// Если это мастер-процесс, считаем кол-во ядер и запускаем определенное количество воркеров,
// и когда инстансы будут запускаться внутри форков то выполнится else часть данного условия.
// Внутри форков есть createServer, который на самом деле создастся в мастере где сядет на указанный порт, а все форки получат
// эмуляцию сервера, тоесть создастся экземпляр сервера, который вместо listen будет получать
// запросы из межпроцессового взаимодействия, и туда будут приходить данные
// HTTP запроса и хендл сокета который приходит из мастер-процесса,
// и дальше съэмулированный сервер будет запускать обработчик описанный внутри createServer().
// Минус такого подхода в том что все запросы идут через мастер и уже затем распределяются по детям,
// это ведет к тому что мастер может быть перегружен.
if (cluster.isMaster) {
  const count = os.cpus().length;
  console.log(`Master pid: ${pid}`);
  console.log(`Starting ${count} forks`);
  for (let i = 0; i < count; i++) cluster.fork();
} else {
  const id = cluster.worker.id;
  console.log(`Worker: ${id}, pid: ${pid}, port: ${PORT}`);
  http.createServer((req, res) => {
    const data = routing[req.url];
    const type = typeof data;
    const serializer = types[type];
    res.setHeader("Process-Id", pid); // Записываем pid чтобы понять какой форк нам ответил.
    res.end(serializer(data, req, res));
  }).listen(PORT);
}
