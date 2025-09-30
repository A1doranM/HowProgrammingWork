"use strict";

// Фабрика объектов.

class Person {
  constructor(name) {
    this.name = name;
  }

  static factory(name) { // Статичный метод возвращающий новый экземпляр Person.
    return new Person(name);
  }
}

// Usage

const p1 = new Person("Marcus");
console.dir({ p1 });

const p2 = Person.factory("Marcus");
console.dir({ p2 });
