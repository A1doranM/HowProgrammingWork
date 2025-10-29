'use strict';

class Person {
  constructor(name) {
    this.name = name;
  }
}

const factorify =
  (Entity) =>
  (...args) =>
    new Entity(...args);

// Usage

const p1 = new Person('Marcus');
console.dir({ p1 });

const personFactory = factorify(Person);
const p2 = personFactory('Marcus');
console.dir({ p2 });
