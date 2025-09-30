"use strict";

// Линзы через ООП
// Они все сгруппированы в один типо неймспейс Lens откуда используются.

const Lens = class {
  constructor(source, destination = source) {
    this.source = source;
    this.destination = destination;
  }
  static from(source, destination) { // Фабрика которая создает экземпляр линзы.
    return new Lens(source, destination);
  }
  get(obj) {
    return obj[this.source];
  }
  set(val, obj) {
    return { ...obj, [this.destination]: val };
  }
  static view(lens, obj) {
    return lens.get(obj);
  }
  static set(lens, val, obj) {
    return lens.set(val, obj);
  }
  static over(lens, map, obj) {
    return lens.set(map(lens.get(obj)), obj);
  }
};

// Usage

const person = {
  name: "Marcus Aurelius",
  city: "Rome",
  born: 121,
};

const nameLens = Lens.from("name");

console.log("view name:", Lens.view(nameLens, person));

console.log("set name:", Lens.set(nameLens, "Marcus", person));

const upper = (s) => s.toUpperCase();
console.log("over name:", Lens.over(nameLens, upper, person));
