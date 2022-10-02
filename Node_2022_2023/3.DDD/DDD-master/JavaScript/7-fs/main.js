"use strict";

// Здесь еще добавляем чуть более улучшенный сервер статики,
// плюс вынесли АПИ в отдельную директорию.
// Теперь все АПИ отделено от системного кода.

const fsp = require("node:fs").promises; // подгружаем ФС но с интерфейсом промисов.
const path = require("node:path");
const server = require("./ws.js");
const staticServer = require("./static.js");

const apiPath = path.join(process.cwd(), "./api"); // Получаем путь к текущему АПИ.
const routing = {};

(async () => {
  const files = await fsp.readdir(apiPath);
  for (const fileName of files) { // Идем по файлам и ищем скрипты.
    if (!fileName.endsWith(".js")) continue; // Если нету идем дальше.
    const filePath = path.join(apiPath, fileName);
    const serviceName = path.basename(fileName, ".js"); // Забираем сервис с АПИ
    routing[serviceName] = require(filePath); // и добавляем подгруженный файл к роутингу.
  }

  staticServer("./static", 8000);
  server(routing, 8001);
})();
