"use strict";

// Пример подгрузки пакетов разными способами.

const p1 = require("./Package1"); // Весь пакет. Имя конкретного файла который подгрузится возьмется из точки входа в package.json
const p2 = require("./Package1/"); // Тоже самое.
const p3 = require("./Package1/."); // Тоже самое.
const m1 = require("./Package1/main"); // Один файл без расширения.
const m2 = require("./Package1/main.js"); // С расширением.
const u1 = require("./Package1/utils"); // ...
const u2 = require("./Package1/utils.js"); // ...
const j1 = require("./Package1/package"); // Без расширения.
const j2 = require("./Package1/package.json"); // С расширением.

console.log({ p1, p2, p3, m1, m2, u1, u2, j1, j2 });
