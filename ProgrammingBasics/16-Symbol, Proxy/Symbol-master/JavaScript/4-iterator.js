"use strict";

// В JS есть уже некоторые специальные символы которые можно добавлять разным объектам
// Например Symbol.iterator.

console.log("iterator in Symbol:", "iterator" in Symbol);

const generateNumbersObject = { start: 1, end: 10 };

generateNumbersObject[Symbol.iterator] = function() { // Добавляем итератор объекту.
  let value = this.start;
  return {
    next: () => ({
      value,
      done: value++ === this.end + 1
    })
  };
};

Object.defineProperty(generateNumbersObject, Symbol.iterator, { // Делаем так чтобы по символу нельзя было
  enumerable: false, // проитерироваться
  configurable: false, // и изменить его.
});

console.dir(generateNumbersObject);

console.log(Object.getOwnPropertySymbols(generateNumbersObject)); // Считать личные символы объекта.

for (const number of generateNumbersObject) {
  console.log(number);
}

const useIterable = (...iterableObjects) => iterableObjects
  .reduce((prev, cur) => prev + cur);

const sum = useIterable(...generateNumbersObject);
console.log("sum:", sum);
