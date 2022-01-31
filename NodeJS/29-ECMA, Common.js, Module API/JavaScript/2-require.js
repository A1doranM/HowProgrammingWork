"use strict";

const fs = require("fs");

// С 16 ноды у обычного require появились префиксы, если есть префикс значит импорт взят
// именно из Ноды.
const events = require("node:events"); // > 16
const timers1 = require("timers/promises"); // Подмодули подгружаются через /
const timers2 = require("node:timers/promises"); // Еще один встроенный модуль.
const ws = require("ws");
const exp = require("./1-export.js"); // Всегда стоит указывать расширение файла, чтобы меньше операций происходило.

console.log(Object.keys(fs));
console.log(Object.keys(events));
console.log(Object.keys(timers1));
console.log(Object.keys(timers2));
console.log(Object.keys(ws));
console.log(Object.keys(exp));
