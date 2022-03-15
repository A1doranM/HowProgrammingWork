"use strict";

const person = { name: "Marcus Aurelius", born: 121 };
const persons = [person];
// Забираем список ключей.
console.dir({
  ownKeys: {
    person: Reflect.ownKeys(person),
    persons: Reflect.ownKeys(persons),
  }
});
