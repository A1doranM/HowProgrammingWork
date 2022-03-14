"use strict";

const types = [Number, String, Boolean, Symbol, BigInt];
const output = types.map(item => ({
  name: item.name,
  type: typeof item,
  ctr: item.constructor.name,
  item,
}));
console.table(output);
