"use strict";

const db = require("./db.js");

const loader = (db) => (entity) => {
  const Entity = class {};
  const desc = { value: entity };
  Object.defineProperty(Entity, "name", desc);
  const sql = `SELECT ${entity} WHERE id = $1`;
  return async (id) => {
    const data = await db.queryRow(sql, [id]);
    return Object.assign(new Entity(), data);
  };
};

// Usage

(async () => {
  const load = loader(db);
  const loadPerson = load("Person");
  const person = await loadPerson(100);
  console.log(person);
})();
