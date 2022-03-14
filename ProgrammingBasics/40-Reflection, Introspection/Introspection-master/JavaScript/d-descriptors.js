"use strict";

const object = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol("d")]: 4,
  [Symbol("e")]: 5,
};

const array = [1, 2, 3];

const objectProperties = Object
  .getOwnPropertyNames(object)
  .map(key => ({ key, ...Object.getOwnPropertyDescriptor(object, key) }));

const objectSymbolProperties = Object
  .getOwnPropertySymbols(object)
  .map(key => ({ key, ...Object.getOwnPropertyDescriptor(object, key) }));

const arrayProperties = Object
  .getOwnPropertyNames(array)
  .map(key => ({ key, ...Object.getOwnPropertyDescriptor(array, key) }));

console.table(objectProperties);
console.table(objectSymbolProperties);
console.table(arrayProperties);
