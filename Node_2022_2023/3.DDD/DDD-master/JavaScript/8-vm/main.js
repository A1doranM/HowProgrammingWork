"use strict";

// Еще более продвинутый пример с использованием нашей системы модульности
// с первого урока.

const fsp = require("node:fs").promises;
const path = require("node:path");
const server = require("./ws.js");
const staticServer = require("./static.js");
const load = require("./load.js"); // Наша система модульности.
const db = require("./db.js");
const hash = require("./hash.js");

const sandbox = { console, db: Object.freeze(db), common: { hash } }; // Создаем контекст с сущностями доступными для модулей.
const apiPath = path.join(process.cwd(), "./api");
const routing = {};

(async () => {
  const files = await fsp.readdir(apiPath);
  for (const fileName of files) {
    if (!fileName.endsWith(".js")) continue;
    const filePath = path.join(apiPath, fileName);
    const serviceName = path.basename(fileName, ".js");
    routing[serviceName] = await load(filePath, sandbox); // И в роутинг отдаем уже песочницу с методами.
  }

  staticServer("./static", 8000);
  server(routing, 8001);
})();
