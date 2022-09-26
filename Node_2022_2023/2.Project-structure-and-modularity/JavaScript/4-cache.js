"use strict";

// Манипуляции с кэшем.

// Взяли модуль в одном месте.
const ex1 = require("./1-export.js");

// Получили путь к модулю.
const modulePath = require.resolve("./1-export.js");

// По умолчанию require даст ссылку на один и тот же объект.
// Тоесть примешав что-то к библиотеке в одном
// месте мы получим эту же примесь и в другом.

console.log({ required: modulePath });
console.log(require.cache[modulePath]);

// Но если мы очистим кэш
delete require.cache[modulePath];
console.log({ cached: require.cache[modulePath] });
const ex2 = require("./1-export.js");

// То ссылки станут не равны.
console.log(ex1 === ex2);

const ws = require("ws");
const wsPath = require.resolve("ws");
console.log(ws, wsPath);
console.log(Object.keys(require.cache));
