"use strict";

const person = { name: "Marcus Aurelius" };

Reflect.defineProperty(person, "born", {
  value: 121,
  writable: true,
  enumerable: true,
  configurable: true,
});

Object.defineProperty(person, "city", {
  value: "Roma",
  writable: false,
  enumerable: false,
  configurable: false,
});

person.born = 1917;
// person.city = "Kiev";

console.dir({ person });
