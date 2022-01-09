"use strict";

// Самый простой вид утечек памяти. Миксин в глобал.

// Храним историю использования памяти.
const memory = [];
let k = 0;

// Функция переводит байты в мегабайты.
const bytesToMb = bytes => Math.round(bytes / 1000, 2) / 1000;

const timer = setInterval(() => {
  k++;
  const key = "globalVariable" + k;
  global[key] = new Array(1000).fill(key); // Создаем утечку добавляя в глобал массив со всякой фигней.
}, 5);

// Рас в секунду
setInterval(() => {
  console.clear(); // Очищаем консоль.
  const usage = process.memoryUsage(); // Берем использование памяти.
  const row = {
    rss: bytesToMb(usage.rss), // process resident set size.
    heapTotal: bytesToMb(usage.heapTotal), // v8 heap allocated.
    heapUsed: bytesToMb(usage.heapUsed), // v8 heap used.
    external: bytesToMb(usage.external), // С++ allocated.
    stack: bytesToMb(usage.rss - usage.heapTotal), // stack.
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
