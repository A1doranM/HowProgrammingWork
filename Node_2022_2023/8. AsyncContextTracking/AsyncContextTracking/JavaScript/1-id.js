"use strict";

// Пример с использованием AsyncLocalStorage на простом сервере
// Вообще AsyncLocalStorage это такой себе shared state для цепочки асинхронных
// вызовов.

const http = require("node:http");
const { AsyncLocalStorage } = require("node:async_hooks");

const application = {
  nextRequestId: 0,
  asyncLocalStorage: new AsyncLocalStorage(),
  user: { name: "Marcus", balance: 0 },
};

const routing = {
  "/": "<h1>welcome to homepage</h1><hr>",
  "/user": application.user,
  "/user/name": () => application.user.name.toUpperCase(),
  "/user/balance": () => application.user.balance,
  "/api/method1": async (req, res) => { // 5) Роут берет ид из локального хранилища
    const id = application.asyncLocalStorage.getStore(); // вот тут.
    console.log(`${id} ${req.method} ${req.url} ${res.statusCode}`);
    application.asyncLocalStorage.exit(() => { // 6) Выходим из хранилища.
      if (id) console.log({ id });
    });
    return { id, user: application.user };
  },
};

const types = {
  object: JSON.stringify,
  string: (s) => s,
  undefined: () => "not found",
  function: async (fn, req, res) => { // 4) Вызываем нужный роут отдавая ему req, res.
    const result = await fn(req, res);
    return JSON.stringify(result);
  },
};

http.createServer((req, res) => {
  const data = routing[req.url];
  const type = typeof data;
  const endpoint = types[type];
  const id = application.nextRequestId++; // 1) Для каждого запроса генерим ид
  application.asyncLocalStorage.run(id, async () => { // 2) сохраняем в хранилище
    const result = await endpoint(data, req, res); // 3) отдаем данные в обработчик.
    res.end(result);
  });
}).listen(8000);

setInterval(() => {
  application.user.balance += 10;
}, 1000);
