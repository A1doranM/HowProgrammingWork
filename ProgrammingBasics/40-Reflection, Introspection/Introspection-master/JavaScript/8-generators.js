"use strict";

const types = [
  (function * () {}),
  (function * () {})(),
  (function * () {})().next(),
  (async function * () {}),
  (async function * () {})(),
  (async function * () {})().next(),
];

const output = types.map(item => ({
  type: typeof item,
  ctr: item.constructor.name,
  item,
}));
console.table(output);
