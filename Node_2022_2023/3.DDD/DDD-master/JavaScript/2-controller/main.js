"use strict";

// Пример без экспресса.

const http = require("node:http");
const pg = require("pg");
const hash = require("./hash.js");
const receiveArgs = require("./body.js");

const PORT = 8000;

const pool = new pg.Pool({
  host: "127.0.0.1",
  port: 5432,
  database: "example",
  user: "marcus",
  password: "marcus",
});

// Роутинг проекта. Например здесь уже методы ничего не знают про протокол
// тоесть это может быть и вэб сокет и хттп.

const routing = {
  user: {
    get(id) {
      if (!id) return pool.query("SELECT id, login FROM users");
      const sql = "SELECT id, login FROM users WHERE id = $1";
      return pool.query(sql, [id]);
    },

    async post({ login, password }) {
      const sql = "INSERT INTO users (login, password) VALUES ($1, $2)";
      const passwordHash = await hash(password);
      return pool.query(sql, [login, passwordHash]);
    },

    async put(id, { login, password }) {
      const sql = "UPDATE users SET login = $1, password = $2 WHERE id = $3";
      const passwordHash = await hash(password);
      return pool.query(sql, [login, passwordHash, id]);
    },

    delete(id) {
      const sql = "DELETE FROM users WHERE id = $1";
      return pool.query(sql, [id]);
    },
  },
};

http.createServer(async (req, res) => { // Сервер
  const { method, url, socket } = req; // Забираем из реквеста метод, урл, сокет
  const [name, id] = url.substring(1).split("/"); // парсим урл
  const entity = routing[name]; // и получаем список роутов для нужной сущьности
  if (!entity) return res.end("Not found");
  const handler = entity[method.toLowerCase()]; // читаем какой метод вызвать из роутинга
  if (!handler) return res.end("Not found");
  const src = handler.toString(); // получаем исходный код метода
  const signature = src.substring(0, src.indexOf(")")); // и забрали из него то что в скобочках (тоесть параметры фукнции)
  const args = []; // загатавливаем массив аргументов
  if (signature.includes("(id")) args.push(id); // если нужен id, добавляем его,
  if (signature.includes("{")) args.push(await receiveArgs(req)); // если нужны еще аргументы, добавляем остальные аргументы достав их из body запроса
  console.log(`${socket.remoteAddress} ${method} ${url}`);
  const result = await handler(...args); // выполняем метод
  res.end(JSON.stringify(result.rows)); // возвращаем результат.
}).listen(PORT); // это шаблон фронт-контроллер, его суть в том чтобы создать одну точку входа для всех запросов.

console.log(`Listen on port ${PORT}`);
