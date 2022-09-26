"use strict";

// Вот так загружаем кастомные модули.
const exp = require("./1-export.js");
// Резолв позволяет получить абсолютный путь к файлу.
const expPath = require.resolve("./1-export.js");
// Кэш модулей, по ключу можно посмотреть что экспортирует модуль.
const expModule = require.cache[expPath];
console.log({ exp, expPath, expModule });

const events = require("node:events");
const eventsPath = require.resolve("node:events");
const eventsModule = require.cache[eventsPath];
console.log({ events, eventsPath, eventsModule });
