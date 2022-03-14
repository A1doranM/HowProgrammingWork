"use strict";

const person = { name: "Marcus Aurelius", born: 121 };
const persons = [person];

console.dir({
  ownKeys: {
    person: Reflect.ownKeys(person),
    persons: Reflect.ownKeys(persons),
  }
});
