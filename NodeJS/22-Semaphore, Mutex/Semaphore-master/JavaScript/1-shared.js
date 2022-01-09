"use strict";

// Семафоры как и мьютекс нужны для создания областей памяти которые лочатся для отдельного потока
// и заставляют другие потоки ждать пока секция не освободится. Это позволяет избежать race-condition
// состояния когда оба потока пытаются сделать что-то с одним ресурсом.

// Пример с race-condition. Когда по идее мы должны просто
// инкрементировать все значения в массиве на 1. Но из-за того
// что с ним работают одновременно два потока значения увеличенны не однородно.
const threads = require("worker_threads");
const { Worker, isMainThread } = threads;

if (isMainThread) {
  const buffer = new SharedArrayBuffer(10); // SharedBuffer создает разделяемую область памяти.
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const array = new Int8Array(workerData);
  const value = threadId === 1 ? 1 : -1;
  setInterval(() => {
    for (let i = 0; i < 10; i++) {
      array[i] += value;
    }
    console.dir([ threadId, array ]);
  }, 100); // change to 10 to see race condition
}
