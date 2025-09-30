"use strict";

const fs = require("node:fs");

// Contracts:
// - Readable
// - EventEmitter
// - AsyncIterator

const readable = fs.createReadStream("1-readable.js");

// Styles generating data:
// - fs.createReadStream or other API
// - readable.push()
// - Readable.from(async function *) - создаем стрим из функции - генератора
// - Readable.from(string or Buffer) - создаем стрим из буффера

readable.on("error", (error) => {
  console.log({ error });
});

readable.on("end", () => {
  console.log({ event: "end" });
});

readable.on("close", () => {
  console.log({ event: "close" });
});

// Styles of reading data from streams:
// - on("data")
// - on("readable")
// - .pipe()
// - AsyncIterable

// Style: on("data")

// Вызывается каждый раз когда в стрим проходят данные.

readable.on("data", (chunk) => {
  console.log({ data: chunk });
});

// Style: on("readable") - будет вызываться тогда когда от одного до нескольких
//                         пакетов с данными скопилось внутри стрима.
//                         Таким образом мы можем прочитать сразу все скопившиеся пакеты

readable.on("readable", () => {
  let data = readable.read(); // получаем пакет данных если он есть
  console.log({ event: "readable" });
  while (data !== null) { // пока есть данные
    console.log({ readable: data });
    data = readable.read();
  }
});
