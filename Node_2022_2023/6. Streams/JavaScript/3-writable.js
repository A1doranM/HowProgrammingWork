"use strict";

const fs = require("node:fs");
const stream  = require("node:stream");

// - Создаем стрим из асинхронного генератора.

async function * dup(char, size) {
  let counter = 0;
  while (counter++ < size) {
    // throw new Error("Error generating data");
    yield char;
  }
}

// Создаем стрим на чтение
const readable = stream.Readable.from(dup("A", 1_000_000));

// Стрим на запись который будет писать данные в файл
const writable = fs.createWriteStream("data.tmp");

readable.on("data", (data) => {
  writable.write(data);
});

readable.on("error", (error) => {
  console.log({ readable: error });
});

writable.on("error", (error) => {
  console.log({ writable: error });
});
