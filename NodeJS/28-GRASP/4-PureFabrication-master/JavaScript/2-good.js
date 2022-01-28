"use strict";

const v8 = require("v8");
const fs = require("fs").promises;

class Person {
  constructor(name, surname) {
    this.name = name;
    this.surname = surname;
  }
}

class Storage {
  constructor(path = ".") {
    this.path = path;
  }

  save(id, object) {
    const v8Data = v8.serialize(object);
    const v8File = `${this.path}/${id}.v8`;
    return fs.writeFile(v8File, v8Data);
  }

  async read(id) {
    const v8File = `${this.path}/${id}.v8`;
    const v8Data = await fs.readFile(v8File);
    const { name, surname } = v8.deserialize(v8Data);
    return new Person(name, surname);
  }
}

// Usage

(async () => {
  const storage = new Storage("./data");

  const person1 = new Person("Rene", "Descartes");
  await storage.save(100, person1);

  const person2 = await storage.read(100);
  console.dir(person2);
})();
