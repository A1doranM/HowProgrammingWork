"use strict";

// Три разных способа задания классов.

class Abstraction {}
class Extended extends Abstraction {}
function Prototype() {}

const classes = [Object, Abstraction, Extended, Prototype];

const output = classes.map(Class => ({
  name: Class.name, // Смотрим имя класса.
  type: typeof Class, // Тип класса.
  Class,
  Parent: Object.getPrototypeOf(Class).name, // Имя прототипа.
}));
console.table(output);
