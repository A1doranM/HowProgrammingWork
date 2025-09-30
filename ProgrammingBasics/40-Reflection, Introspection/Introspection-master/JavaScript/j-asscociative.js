"use strict";

// Смотрим что в разных ситуациях вернет typeof.

const cSymbol = Symbol("c");

const object = {
  a: 1,
  [cSymbol]: 2,
  [Symbol("d")]: 3,
};

console.table([
  ["a", object.a, typeof object.a],
  ["b", object.b, typeof object.b],
  [cSymbol, object[cSymbol], typeof object[cSymbol]],
  ["Symbol(\"d\")", object[Symbol("d")], typeof object[Symbol("d")]],
  ["toString", object.toString, typeof object.toString],
]);

console.log();
const array = [1, 2, 3];
array[cSymbol] = 4;
array.key = 5;

console.table([
  [0, array[0], typeof array[0]],
  [1, array[1], typeof array[1]],
  [cSymbol, array[cSymbol], typeof array[cSymbol]],
  ["Symbol(\"d\")", array[Symbol("d")], typeof array[Symbol("d")]],
  ["toString", array.toString, typeof array.toString],
  ["map", array.map, typeof array.map],
  ["length", array.length, typeof array.length],
]);
