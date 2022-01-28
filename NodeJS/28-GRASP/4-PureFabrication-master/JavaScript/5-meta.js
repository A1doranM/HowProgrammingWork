"use strict";

const db = require("./db.js");

const loader = (db) => (entity) => {
  const Entity = class {}; // Делаем на лету пустой класс.
  const desc = { value: entity }; // Делаем дескриктор со значением.
  Object.defineProperty(Entity, "name", desc); // Определяем для пустого класса поле с дескриптором.
  const sql = `SELECT ${entity} WHERE id = $1`;
  return async (id) => {
    const data = await db.queryRow(sql, [id]);
    return Object.assign(new Entity(), data); // Добавляем данные из БД в наш класс.
  };
};
// Тоесть в итоге мы делаем абстрактную сущность которая будет иметь определенное имя и
// заполняться данными которые мы получаем из БД

// Usage


(async () => {
  const load = loader(db);
  const loadPerson = load("Person");
  const person = await loadPerson(100);
  console.log(person);
})();
