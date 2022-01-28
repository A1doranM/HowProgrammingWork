"use strict";

const v8 = require("v8");
const fs = require("fs").promises;

class Person {
  constructor(fileName, name, surname) {
    Object.defineProperty(this, "fileName", {
      enumerable: false,
      writable: true,
      value: fileName,
    });
    this.name = name;
    this.surname = surname;
  }

  save() {
    const v8Data = v8.serialize(this);
    return fs.writeFile(this.fileName, v8Data);
  }

  async read() {
    const v8Data = await fs.readFile(this.fileName);
    const object = v8.deserialize(v8Data);
    Object.assign(this, object);
  }
}

// Usage

(async () => {
  const person1 = new Person("./data/100.v8", "Rene", "Descartes");
  await person1.save();

  const person2 = new Person("./data/100.v8");
  await person2.read();
  console.dir(person2);
})();
