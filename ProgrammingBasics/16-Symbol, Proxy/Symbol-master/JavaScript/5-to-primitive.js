"use strict";

// Использование еще одного встроенного символа Symbol.toPrimitive
// переделывает объект в один из примитивных типов.
// При вызове с арифметическими операторами, или при склейке строк, или в шаблонных строках.

console.log(""toPrimitive" in Symbol", "toPrimitive" in Symbol);

const person = { name: "Gena", age: 19 };

person[Symbol.toPrimitive] = function(hint) {
  // В символ приходит hint который сообщает к какому типу приводится сейчас объект.
  console.log("hint", hint);
  const primitives = { // Создали себе справочник преобразователей.
    number: () => this.age,
    string: () => this.name,
    default: () => JSON.stringify(person)
  };
  return primitives[hint]();
};

Object.defineProperty(person, Symbol.toPrimitive, {
  enumerable: false,
  configurable: false,
});

// Usage:

console.log(+person);
console.log(`${person}`);
console.log(person + "");
