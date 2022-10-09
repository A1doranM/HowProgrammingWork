"use strict";

const fsp = require("node:fs").promises;
const path = require("node:path");
const server = require("./ws.js");
const staticServer = require("./static.js");

const apiPath = path.join(process.cwd(), "./api"); // Путь к папке с апи.
const routing = {}; // Заготовили роутинг.

(async () => {
  const files = await fsp.readdir(apiPath);
  for (const fileName of files) { // Идем по массиву файлов
    if (!fileName.endsWith(".js")) continue; // и собираем js файлы
    const filePath = path.join(apiPath, fileName); // после чего сохраняем их по ключу путь к файлу - имя файла
    const serviceName = path.basename(fileName, ".js"); // вычисляем как будет сервис называться
    routing[serviceName] = require(filePath); // в роутинг по имени сервиса сохраняем файл.
  }

  staticServer("./static", 8000); // Отдаем статику по 8000 порту.
  server(routing, 8001); // запускаем вэб сокеты на 8001.
})();
