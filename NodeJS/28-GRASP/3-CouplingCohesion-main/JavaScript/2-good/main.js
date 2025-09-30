"use strict";

// Хороший пример где все четко разбито по модулям.
// Между модулями есть небольшое зацепление, timeout зацеплен на delay.
// Логгер вообще не зацеплен ни на что.
const http = require("http");

const logger = require("./logger.js");
const delay = require("./delay.js");
const timeout = require("./timeout.js");

// Роутинг, который не зацеплен на запрос и ответ.
// А если потребуются аргументы то парсить их можно внутри контроллера, а сюда просто передавать
// конкретно данные которые нужны для роутов.
const routing = {
  "/": async () => "Hello World!",
  "/page1": async () => {
    await delay(5000);
    return "Hello World!";
  },
};

http.createServer(async (req, res) => {
  const { method, url, headers } = req;
  const requestTime = Date.now();

  res.on("close", () => {
    const time = Date.now() - requestTime;
    logger(method, url, headers.referer, time);
  });

  const handler = routing[req.url];
  if (!handler) return res.end("Not found");
  const result = await Promise.race([handler(), timeout(1000)]); // Ставим условие что все запросы должны сделаться
                                                                             // быстрее чем за 1 секунду. Красота просто.
  res.end(result);
}).listen(8000);
