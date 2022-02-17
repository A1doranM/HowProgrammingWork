"use strict";

const containerValue = Symbol("containerValue");

class Container {
  constructor(value) {
    Object.defineProperty(this, containerValue, {
      configurable: false,
      enumerable: false,
      writable: false,
      value
    });
  }
  getValue() {
    return this[containerValue];
  }
}

// Usage

const container1 = new Container(150);
console.dir({ container1 });
console.log("container1.getValue() =", container1.getValue());

const person = { name: "Marcus", born: 121, city: "Roma" };
const container2 = new Container({ person });
console.dir({ container2 });
console.log("container2.getValue() =", container2.getValue());
