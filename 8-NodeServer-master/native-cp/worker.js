"use strict";

// В воркере создаем сервер который привязывается не на статичный порт, а на вычисляемый
// Тоесть каждый процесс сядет на свой порт.

const http = require("http");

const BASE_PORT = 2000;

const pid = process.pid;
const id = parseInt(process.argv[2], 10);
// Вычисление порта на основе айдишника с мастера
const port = BASE_PORT + id - 1;
const user = { name: "jura", age: 22 };

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

console.log(`Worker: ${id}, pid: ${pid}, port: ${port}`);
http.createServer((req, res) => {
  const data = routing[req.url];
  const type = typeof data;
  const serializer = types[type];
  res.setHeader("Process-Id", process.pid);
  res.end(serializer(data, req, res));
}).listen(port);
