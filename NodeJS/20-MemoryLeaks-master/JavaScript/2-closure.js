"use strict";

// Утечки при помощи замыканий.

const memory = [];

const bytesToMb = bytes => Math.round(bytes / 1000, 2) / 1000;

const recursiveClosure = arr => fn => recursiveClosure(arr.map(g => fn(g))); // Рекурсивное замыкание.
let f = recursiveClosure(new Array(1000).fill(x => x * 2)); // Создаем массив из функций.

const timer = setInterval(() => {
  f = f(fn => x => fn(x) * 2); // За тем еще оборачиваем нашу функцию дополнительно умножая ее результат на 2.
}, 5);                            // Тоесть при каждом срабатывании интервала мы еще и еще будем оборачивать обертку и в итоге память будет утекать.

setInterval(() => {
  console.clear();
  const usage = process.memoryUsage();
  const row = {
    rss: bytesToMb(usage.rss),
    heapTotal: bytesToMb(usage.heapTotal),
    heapUsed: bytesToMb(usage.heapUsed),
    external: bytesToMb(usage.external),
    stack: bytesToMb(usage.rss - usage.heapTotal),
  };
  memory.push(row);
  console.table(memory);
}, 1000);

setTimeout(() => {
  clearInterval(timer);
}, 10000);

setTimeout(() => {
  process.exit(0);
}, 15000);
