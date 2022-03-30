"use strict";

const fs = require("fs");

// args[0] - key
// args[args.length-1] - callback

// Мемоизация асинхронных функций из библиотеки, или объекта
// с контрактом коллбэк ласт.

const memoizeAsync = (lib, fnName) => {
  const fn = lib[fnName]; // Заберем функцию из библиотеки.
  const cache = Object.create(null); // Кэш.
  console.log("override", fnName);
  lib[fnName] = (...args) => { // Саму функцию в библиотеке заменим на нашу реализацию.
    console.dir({ call: fnName, args, cache });
    const cb = args.pop(); // Заберем коллбэк из последнего аргумента.
    const key = args[0]; // Заберем из первого аргумента функции.
    const record = cache[key]; // Смотрим есть ли такое значение в кэше.
    console.log("key:", key);
    console.log("cached:", record);
    if (record) { // Если есть
      console.log("from cache");
      cb(record.err, record.data); // то вызываем коллбэк отдавая ошибку и данные.
      return; // Завершаем работу.
    }
    fn(...args, (err, data) => { // Иначе вызываем функцию отдавая ей аргументы
      console.log("from file"); // но модифицируя коллбэк
      console.log("Save key:", key);
      cache[key] = { err, data }; // сохраняя результат по ключу в кэш
      console.dir({ cache });
      cb(err, data); // и затем вызываем оригинальный коллбэк.
    });
  };
};

// Usage

memoizeAsync(fs, "readFile");

fs.readFile("4-async.js", "utf8", (err, data) => {
  console.log("data length:", data.length);
  fs.readFile("4-async.js", "utf8", (err, data) => {
    console.log("data length:", data.length);
  });
});
