"use strict";

const cSymbol = Symbol("c");

const object = {
  a: 1,
  [cSymbol]: 2, // Символ через константу.
  [Symbol("d")]: 3, // Символ через конструктор символа.
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
  0: array.hasOwnProperty(0), // Тру.
  1: array.hasOwnProperty(1), // Фолсе.
  10: array.hasOwnProperty(10), // Фолсе.
  cSymbol: array.hasOwnProperty(cSymbol), // Тру.
  "Symbol(\"d\")": array.hasOwnProperty(Symbol("d")), // Фолсе
                              // Символ котрый передаем не равен символу который в объекте,
                              // потому что символы всегда уникальны хоть и могут иметь одинаковые значения.
  toString: array.hasOwnProperty("toString"), // Фолсе потому что взят из прототипа.
  map: array.hasOwnProperty("map"), // Фолсе, тоже самое.
  length: array.hasOwnProperty("length"), // Тру.
});
