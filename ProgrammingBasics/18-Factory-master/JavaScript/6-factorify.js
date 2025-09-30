"use strict";

// Метод который создает фабрику классов.

class Person {
  constructor(name) {
    this.name = name;
  }
}

const factorify = Category => (...args) => new Category(...args);

// Usage

const p1 = new Person("Marcus");
console.dir({ p1 });

const personFactory = factorify(Person);
const p2 = personFactory("Marcus");
console.dir({ p2 });
