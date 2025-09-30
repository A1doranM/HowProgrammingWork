"use strict";

const fs = require("node:fs");
const streams = require("node:stream/promises");
const zlib = require("node:zlib");

// Используем функцию пайплайн которая по очереди передает дайнные из одного
// стрима в другой пропуская их через некую функцию обработчик, используя
// определенные опции.

const main = async () => {
  const readable = fs.createReadStream("data.tmp");
  const writable = fs.createWriteStream("data.gz");
  const gzip = zlib.createGzip(); // Функция для трансформации данных.
  const ac = new AbortController();
  const timeout = setTimeout(() => { // Говорим прервать обработку через 2 секунды.
    ac.abort();
  }, 2000);
  const options = { signal: ac.signal };
  await streams.pipeline(readable, gzip, writable, options);
  clearTimeout(timeout);
  console.log("Done");
};

main();
