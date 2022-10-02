"use strict";

const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");

module.exports = (root, port) => {
  http.createServer(async (req, res) => {
    const url = req.url === "/" ? "/index.html" : req.url; // если обращаются к корню то ищем индекс файл.
    const filePath = path.join(root, url); // конструируем путь.
    try {
      const data = await fs.promises.readFile(filePath); // Читайем файл
      res.end(data); // отдаем.
    } catch (err) {
      res.statusCode = 404;
      res.end("File is not found");
    }
  }).listen(port);

  console.log(`Static on port ${port}`);
};
