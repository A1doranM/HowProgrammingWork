"use strict";

// Базовый сервак на ноде с использованием уже HTTP/2

const fs = require("node:fs");
const http2 = require("node:http2");
const WebSocket = require("ws");

const index = fs.readFileSync("./index.html", "utf8");
const user = { name: "jura", age: 22 };

// Простой роутинг

const routing = {
  "/": index,
  "/user": user,
  "/user/name": () => user.name.toUpperCase(),
  "/user/age": () => user.age,
  "/hello": { hello: "world", andArray: [1, 2, 3, 4, 5, 6, 7] },
  "/api/method1": (req, res) => {
    console.log(req.url + " " + res.statusCode);
    return { status: res.statusCode };
  },
  "/api/method2": (req) => ({
    user,
    url: req.url,
    cookie: req.headers.cookie,
  }),
};

// Система типов основанная на коллбэках, что отдать получив определенный тип
const types = {
  object: JSON.stringify,
  string: (s) => s,
  undefined: () => "not found",
  function: (fn, req, res) => JSON.stringify(fn(req, res)),
};

// Криптографические ключи и их генерация
const key = fs.readFileSync("./cert/key.pem");
const cert = fs.readFileSync("./cert/cert.pem");
const options = { key, cert };

// Используем уже хттп2 сервер которые будет слушать локалхост по хттпс, а не хттп
const server = http2.createSecureServer(options, (req, res) => {
  const data = routing[req.url];
  const type = typeof data;
  const serializer = types[type];
  const result = serializer(data, req, res);
  res.end(result);
});

server.listen(8000);
console.log("Open: https://127.0.0.1:8000");

const ws = new WebSocket.Server({ server });

ws.on("connection", (connection, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`Connected ${ip}`);
  connection.on("message", (message) => {
    console.log("Received: " + message);
  });
  connection.on("close", () => {
    console.log(`Disconnected ${ip}`);
  });
});

setInterval(() => user.age++, 2000);
