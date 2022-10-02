"use strict";

// Вынесли все что касается фреймворка в отдельный файл хттп.

const server = require("./http.js");
const db = require("./db.js");

const routing = {
  user: require("./user.js"),
  country: db("country"),
  city: db("city"),
};

// Теперь просто передаем серверу роутинг и порт.

server(routing, 8000);
