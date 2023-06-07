"use strict";

// Пример с СНИ
// SNI (Server Name Indication) поддержка нескольких доменов с отдельными или
// мультидоменными сертификатами

const fs = require("node:fs");
const https = require("node:https");

// The node:tls module provides an implementation of the Transport Layer
// Security (TLS) and Secure Socket Layer (SSL) protocols that is built on
// top of OpenSSL.
const tls = require("node:tls");

const user = { name: "jura", age: 22 };

const routing = {
  "/": "<h1>welcome to homepage</h1><hr>",
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

const types = {
  object: JSON.stringify,
  string: (s) => s,
  undefined: () => "not found",
  function: (fn, req, res) => JSON.stringify(fn(req, res)),
};

const key = fs.readFileSync("./cert/key.pem");
const cert = fs.readFileSync("./cert/cert.pem");

// Коллекция доменов с собственными контекстами
const domains = {
  "127.0.0.1": tls.createSecureContext({ key, cert }),
  localhost: tls.createSecureContext({ key, cert }),
};

// Проходимся по коллекции доменов
const sni = (servername, callback) => {
  console.log({ servername });
  const creds = domains[servername]; // Забираем сертификат
  if (!creds) callback(new Error(`No certificate for ${servername}`)); // Если нету
  callback(null, creds); // Если есть вызываем функцию которую нам прокинет createServer
  // передавая ей сертификат зарегистрированный для этого домена
};

const options = { SNICallback: sni };

const server = https.createServer(options, (req, res) => {
  const data = routing[req.url];
  const type = typeof data;
  const serializer = types[type];
  const result = serializer(data, req, res);
  res.end(result);
});

server.listen(8000);
console.log("Open: https://127.0.0.1:8000");
console.log("   or https://localhost:8000");

setInterval(() => user.age++, 2000);
