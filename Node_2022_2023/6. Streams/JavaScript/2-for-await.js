"use strict";

// Как мы можем записывать данные в стрим

const stream  = require("node:stream");

const readable = new stream.Readable();

// Write style: readable.push(data) - стиль в котором мы добавляем данные
// Read style: AsyncIterable - стиль в котором мы считываем данные снизу

readable.push("Hello ");
//readable.emit("error", new Error("Cant generate data")); - вызываем ошибку
readable.push("World!");
readable.push(null);

const main = async () => {
  try {
    for await (const chunk of readable) {
      console.log({ chunk });
    }
  } catch (e) {
    console.log(e);
  }
};

main();
