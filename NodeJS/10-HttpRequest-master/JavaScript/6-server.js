"use strict";

const http = require("http");

const users = {
  marcus: { name: "Marcus Aurelius", city: "Rome", born: 121 },
  mao: { name: "Mao Zedong", city: "Shaoshan", born: 1893 },
};

const routing = {
  "/api/user": name => users[name],
  "/api/userBorn": name => users[name].born
};

http.createServer((req, res) => {
  const url = req.url.split("/"); // Парсим урл
  const par = url.pop(); // выделяем из него параметры
  const method = routing[url.join("/")]; // и метод
  const result = method ? method(par) : { error: "not found" };
  res.end(JSON.stringify(result));
}).listen(8000);
