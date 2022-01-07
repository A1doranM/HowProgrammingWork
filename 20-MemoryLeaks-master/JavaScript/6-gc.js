"use strict";

// При помощи ключей команой строки можно управлять сборщиком мусора.
// --expose-gc поместит функцию gc в глобал. И мы сможем вручную управлять
// сборщиком мусора.

const memory = [];
let k = 0;

const bytesToMb = bytes => Math.round(bytes / 1000, 2) / 1000;

let collection = {};

const timer = setInterval(() => {
  k++;
  const key = "globalVariable" + k;
  collection[key] = new Array(1000).fill(key);
}, 5);

setInterval(() => {
  console.clear();
  const usage = process.memoryUsage();
  const row = {
    rss: bytesToMb(usage.rss), // process resident set size
    heapTotal: bytesToMb(usage.heapTotal), // v8 heap allocated
    heapUsed: bytesToMb(usage.heapUsed), // v8 heap used
    external: bytesToMb(usage.external), // c++ allocated
    stack: bytesToMb(usage.rss - usage.heapTotal), // stack
  };
  memory.push(row);
  console.table(memory);
}, 1000);

setTimeout(() => {
  clearInterval(timer);
  if (global.gc) {
    collection = {};
    gc(); // Вызываем сборщик мусора. Но надо понимать что это дорогая по времени операция
          // И одно дело вызывать его в мелком процессе на 100 МБ. А совсем другое в продакшне
          // на процессе весом в пару гигабайт. Это приостановит работу приложения на заметное время.
  }
}, 10000);

setTimeout(() => {
  process.exit(0);
}, 15000);
