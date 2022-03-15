"use strict";

// Посмотрим что собой представляют разные коллекции

const types = [Object, Array, Set, Map, WeakSet, WeakMap, Int8Array];
const output = types.map(item => ({
  name: item.name,
  type: typeof item,
  ctr: item.constructor.name,
  item,
}));
console.table(output);
