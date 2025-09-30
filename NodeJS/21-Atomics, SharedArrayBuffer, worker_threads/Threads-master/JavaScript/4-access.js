"use strict";

const threads = require("worker_threads");

const { buffer } = threads.workerData; // Забираем данные которые передали воркеру.
const array = new Int8Array(buffer); // Переводим то что нам передали в типизированный массив.
array[0] = 123;
threads.parentPort.postMessage({ name: "display" });
