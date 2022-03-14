"use strict";

class Abstraction {}
class Extended extends Abstraction {}
function Prototype() {}

const classes = [Object, Abstraction, Extended, Prototype];

const output = classes.map(Class => ({
  name: Class.name,
  type: typeof Class,
  Class,
  Parent: Object.getPrototypeOf(Class).name,
}));
console.table(output);
