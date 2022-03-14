"use strict";

const cSymbol = Symbol("c");

const object = {
  a: 1,
  [cSymbol]: 2,
  [Symbol("d")]: 3,
};

console.table({
  a: object.hasOwnProperty("a"),
  b: object.hasOwnProperty("b"),
  cSymbol: object.hasOwnProperty(cSymbol),
  "Symbol(\"d\")": object.hasOwnProperty(Symbol("d")),
  toString: object.hasOwnProperty("toString"),
});

console.log();
const array = [1, 2, 3];
array[cSymbol] = 4;
array.key = 5;

console.table({
  0: array.hasOwnProperty(0),
  1: array.hasOwnProperty(1),
  10: array.hasOwnProperty(10),
  cSymbol: array.hasOwnProperty(cSymbol),
  "Symbol(\"d\")": array.hasOwnProperty(Symbol("d")),
  toString: array.hasOwnProperty("toString"),
  map: array.hasOwnProperty("map"),
  length: array.hasOwnProperty("length"),
});
