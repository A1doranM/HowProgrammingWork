"use strict";

// Очищаем кеш при достижении определенного размера.
const argKey = x => x.toString() + ":" + typeof x;
const generateKey = args => args.map(argKey).join("|");

const memoize = (fn, length) => {
  const cache = new Map(); // Используем Мар вместо объекта.
  return (...args) => {
    const key = generateKey(args);
    console.log(`${fn.name}(${key}) call`);
    if (cache.has(key)) return cache.get(key);
    console.log(`max(${key}) calculate`);
    const res = fn(...args);
    if (cache.size >= length) { // Проверяем длину и если она больше чем надо
      const firstKey = cache.keys().next().value; // забираем первый ключ
      console.log("Delete key:", firstKey);
      cache.delete(firstKey); // удаляем первый ключ.
    }
    cache.set(key, res);
    return res;
  };
};

// Usage

const max = (a, b) => (a > b ? a : b);
const mMax = memoize(max, 3);

mMax(10, 8);
mMax(10, 8);
mMax(1, 15);
mMax(12, 3);
mMax(15, 2);
mMax(1, 15);
mMax(10, 8);
mMax(0, 0);
mMax(0, 0);
