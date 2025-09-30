"use strict";

const db = require("./db.js");

class Person {}

const loader = (db) => (entity) => {
  const sql = `SELECT ${entity} WHERE id = $1`;
  return async (id) => {
    const data = await db.queryRow(sql, [id]);
    return Object.assign(new Person(), data);
  };
};

// Usage

(async () => {
  const load = loader(db);
  const loadPerson = load("Person");
  const person = await loadPerson(100);
  console.log(person);
})();
