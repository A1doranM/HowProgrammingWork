"use strict";

// Пример с шарингом структур данных между потоками.

const threads = require("worker_threads");
const { Worker } = threads;

const buffer = new SharedArrayBuffer(1024);
const array = new Int8Array(buffer); // Создаем типизированный массив заданного размера.

const worker = new Worker("./4-access.js", { workerData: { buffer } }); // Запускам воркер, передавая ему буффер.

worker.on("message", (msg) => {
  if (msg.name === "display") {
    console.dir({ value: array[0] });
  }
});
