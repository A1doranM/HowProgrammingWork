"use strict";

// Клиент для обращения к серверу и запуску задач. Подобный код тоже описан
// в одной из лекций где мы на клиенте генерируем методы для запроса на сервер
// исходя из некоего списка.

const http = require("http");

const api = {};
const methods = ["startCounter", "stopCounter"]; // Список методов.

const createMethod = (name) => (...args) => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: "localhost",
    port: 8000,
    path: `/api/${name}`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, async (res) => {
    if (res.statusCode !== 200) {
      reject();
      return;
    }
    res.setEncoding("utf8");
    const buffers = []; // Массив для данных.
    res.on("data", (chunk) => {
      buffers.push(chunk);
    }).on("end", () => {
      const data = Buffer.concat(buffers).toString(); // Делаем из буфера строку.
      resolve(JSON.parse(data)); // Завершаем промис.
    }).on("error", reject);
  });
  req.end(JSON.stringify(args));
});

for (const method of methods) {
  api[method] = createMethod(method);
}

module.exports = { api };
