"use strict";

// Разные способы создания функций.

const types = [
  Function,
  (async () => {}).constructor,
  (function * () {}).constructor,
  (async function * () {}).constructor,
];

const output = types.map(item => ({
  name: item.name,
  type: typeof item,
  ctr: item.constructor.name,
  item,
}));
console.table(output);
