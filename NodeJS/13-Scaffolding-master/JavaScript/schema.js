"use strict";

const path = require("path");
const fs = require("fs");

const entities = new Map(); // Коллекция схем

const loadEntity = (schemaPath, name) => { // Функция для загрузки схемы по заданному пути.
  const filePath = schemaPath + name;
  const key = path.basename(filePath, ".js");
  try {
    const modulePath = require.resolve(filePath); // Проверяем если схема уже загружалась то очищаем ее из кеша.
    delete require.cache[modulePath];
  } catch (e) {
    return;
  }
  try {
    const entity = require(filePath); // Загружаем схему.
    entities.set(key, entity);
  } catch (e) {
    entities.delete(name); // если не удалось сохранить, или загрузить схему, то удаляем ее из списка.
  }
};

const schema = {};

schema.load = (schemaPath) => { // Подгрузка всех схем из папки.
  fs.readdir(schemaPath, (err, files) => {
    if (err) return;
    files.forEach((name) => {
      loadEntity(schemaPath, name);
    });
  });
  return schema;
};

schema.get = (name) => entities.get(name);

module.exports = schema;
