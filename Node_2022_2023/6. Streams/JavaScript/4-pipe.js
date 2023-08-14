"use strict";

// Читаем и пишем при помощи пайпа.

// Берем файл из предыдущего примера

const fs = require("node:fs");
const stream  = require("node:stream");

const readable = fs.createReadStream("data.tmp"); // читаем данные.
const writable = new stream.Writable({ // Создаем стрим на запись.
  write(chunk, encoding, next) {
    console.log({ size: chunk.length, encoding, next }); // Пишем данные в лог.
    //next(new Error("Error flushing data")); // Генерация ошибки.
    next();
  }
});

readable.pipe(writable); // При помощи пайп передаем данные из стрима на чтение в
                         // стрим на запись.

readable.on("end", () => {
  console.log("Done");
});
