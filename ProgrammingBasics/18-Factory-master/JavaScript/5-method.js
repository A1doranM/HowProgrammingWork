"use strict";

class Person {
  constructor(name) {
    this.name = name;
  }

  static factory(name) {
    return new Person(name);
  }
}

// Usage

const p1 = new Person("Marcus");
console.dir({ p1 });

const p2 = Person.factory("Marcus");
console.dir({ p2 });
