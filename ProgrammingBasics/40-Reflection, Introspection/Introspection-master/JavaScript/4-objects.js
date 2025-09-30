"use strict";

// Рассматриваем почти все что наследуется от Object.

const constructors = [Object, Array, Date, Error, Promise, Proxy, RegExp];
const output = constructors.map(ctr => ({
  name: ctr.name,
  type: typeof ctr,
  ctr,
}));
console.table(output);
