"use strict";

// in выдаст Тру для всех собственных и примешанных значений, но Фолсе,
// для всех унаследованных.

const cSymbol = Symbol("c");

const object = {
  a: 1,
  b: 2,
  [cSymbol]: 3,
};

for (const key in object) {
  console.dir({ key, value: object[key] });
}

console.table({
  a: "a" in object, // Тру.
  b: "b" in object, // Тру.
  cSymbol: cSymbol in object, // Тру.
  toString: toString in object, // Фолсе.
});

console.log();
const array = [1, 2, 3];
array[cSymbol] = 4;
array.key = 5;

for (const index in array) {
  console.dir({ index, value: array[index] });
}

console.table({
  0: 0 in array,
  1: 1 in array,
  10: 10 in array,
  cSymbol: cSymbol in array,
  key: "key" in array,
  toString: toString in array,
});
