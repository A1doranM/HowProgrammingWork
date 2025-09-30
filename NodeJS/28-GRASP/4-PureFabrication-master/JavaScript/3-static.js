"use strict";

const db = require("./db.js");

class Person {
  constructor(name, surname) {
    this.name = name;
    this.surname = surname;
  }

  static async load(id) {
    const sql = "SELECT Person WHERE id = $1";
    const data = await db.queryRow(sql, [id]);
    return new Person(data.name, data.surname);
  }
}

// Usage

(async () => {
  const person1 = await Person.load(100);
  console.dir(person1);
})();
