"use strict";

// Обычный Common.js модуль
// module.exports попадает в файл через requeire.
// В файл под капотом оборачивается вот в такую конструкцию (module, require, __filename, __filepath) => { наш код }

class Entity {}

const fn = (x) => x;

const collection = new Map();

module.exports = { Entity, fn, collection };
