"use strict";

// Пример со сменой протокола, например здесь добавляем вэбсокеты.
// Плюс добавили небольшой сервер для отдачи статики.
// Все файлы кроме вэб сокетов без изменений.

const server = require("./ws.js"); // Здесь можем теперь переключить все на require("./http.js")
const staticServer = require("./static.js");
const db = require("./db.js");

const routing = {
  user: require("./user.js"),
  country: db("country"),
  city: db("city"),
};

staticServer("./static", 8000);
server(routing, 8001);
