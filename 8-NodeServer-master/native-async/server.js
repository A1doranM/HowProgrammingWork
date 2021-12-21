"use strict";

// Пример асинхронного сервера на коллбеках

const http = require("http");

const user = { name: "jura", age: 22 };

const routing = {
  "/": "<h1>welcome to homepage</h1><hr>",
  "/user": user,
  "/user/name": () => user.name.toUpperCase(),
  "/user/age": () => user.age,
  "/hello": { hello: "world", andArray: [1, 2, 3, 4, 5, 6, 7] },
  // Асинхронный метод
  "/api/method1": (req, res, callback) => {
    console.log(req.url + " " + res.statusCode);
    setTimeout(callback({ status: res.statusCode }), 0) ;
  },
  // Синхронный метод
  "/api/method2": req => ({
    user,
    url: req.url,
    cookie: req.headers.cookie,
  }),
};

// Все сериализаторы теперь с колбеками
// Но тем неменее они все синхронные, но можно добавить что-то что сделает их асинхронными (таймер и т.д.), так как конкракты уже соответствуют.
const types = {
  object: ([data], callback) => callback(JSON.stringify(data)),
  undefined: (args, callback) => callback("not found"),
  // Для функций поставим условие, если у функции меньше 3 параметров то это синхронные функции, а если больше то асинхронные
  function: ([fn, req, res], callback) => {
    if (fn.length === 3) fn(req, res, callback);
    else callback(JSON.stringify(fn(req, res)));
  },
};


// Отвечает за выдачу данных на клиента
// если у нас строка, или другое скалярное значение то его отдаем сразу
// иначе ищем нужный тип в сериалайзере
// у сериалайзера есть второй параметр кооллбек,
// и теперь суть сериалайзера в том чтобы все свести к строке и опять вызвать фукнцию serve
const serve = (data, req, res) => {
  const type = typeof data;
  if (type === "string") return res.end(data);
  const serializer = types[type];
  serializer([data, req, res], data => serve(data, req, res));
};

http.createServer((req, res) => {
  const data = routing[req.url];
  serve(data, req, res);
}).listen(8000);

setInterval(() => user.age++, 2000);
