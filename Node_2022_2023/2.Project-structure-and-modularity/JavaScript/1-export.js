"use strict";

// Типичный нодовский файл который экспортирует что-то.

class Entity {}

const fn = (x) => x;

const collection = new Map();

// Откуда взялся модуль. Он был внедрен сюда нодовским загрузчиком через VM.createScript()
// таким же способом в каждый модуль внедрены модификаторы __dirname__, __filename__, require и другие
// которые мы используем.
module.exports = { Entity, fn, collection };
