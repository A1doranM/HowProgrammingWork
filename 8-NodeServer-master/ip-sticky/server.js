"use strict";

// Балансировка с привязкой по ИП
const os = require("os");
const net = require("net");
const http = require("http");
const cluster = require("cluster");
const cpus = os.cpus().length;

if (cluster.isMaster) {

  console.log(`Master pid: ${process.pid}`);
  console.log(`Starting ${cpus} forks`);

  const workers = [];

  for (let i = 0; i < cpus; i++) {
    const worker = cluster.fork();
    workers.push(worker);
  }

  // Специальная функция которая преобразовывает ID к одному числу.
  // Ид состоит из четырех чисел разделенных точкой, мы разбиваем его на 4 числа, затем сдвигаем на 8 бит, и сохраняем,
  // это делается, так как если просто склеить 4 числа ID то они вылезут за размер инта.
  const ipToInt = ip => ip.split(".")
    .reduce((res, item) => (res << 8) + (+item), 0);

  // Балансировщик в который приходит сокет
  // берем IP сокета, затем берем берем отстаток от деления на количестко процессоров.
  // Таким образом пул из некторого числа номеров IP будет попадать на определенный воркер.
  // Например IP-шники у которых остаток от деления 2 будут попадат второму воркеру, а те у которых 3, третьему, и т.д.
  // И затем передаем сокет воркеру.
  const balancer = socket => {
    const ip = ipToInt(socket.remoteAddress);
    const id = Math.abs(ip) % cpus;
    const worker = workers[id];
    if (worker) worker.send({ name: "socket" }, socket);
  };

  // Вешаем балансировщик на порт. Изначально все запросы приходят на этот порт и попадают в балансировщик.
  const server = new net.Server(balancer);
  server.listen(2000);

} else {
  // Воркер.
  console.log(`Worker pid: ${process.pid}`);


  const dispatcher = (req, res) => {
    console.log(req.url);
    res.setHeader("Process-Id", process.pid);
    res.end(`Hello from worker ${process.pid}`);
  };

  const server = http.createServer(dispatcher);
  server.listen(null); // При передаче NULL createServer понимает что ему надо эмулировать прослушку чего либо,
                            // а на самом деле он будет слушать межпроцессовое взаимодействие, где библиотека сокет будет подсовывать ему сокеты.

  // Ссылка на распарсаный месседж и объект сокета.
  process.on("message", (message, socket) => {
    if (message.name === "socket") {
      socket.server = server; // Сокету добавляем свойство сервер, так как старый сервер к которому он был привязан находится в другом аддресном пространстве, ведь балансировщик раскидал их по воркерам.
      server.emit("connection", socket); // Сокету посылаем событие коннекшн, которое в итоге вызовет диспатч метод который написан выше.
    }
  });

}
