"use strict";

const object = { a: 1, b: 2, c: 3 };

const array = [1, 2, 3];

const map = new Map();
map.set("a", 1);
map.set("b", 2);
map.set("c", 3);

const set = new Set();
set.add("a");
set.add("b");
set.add("c");

console.table({
  objectEntries: Object.entries(object),
  arrayEntries: Object.entries(array),
  mapEntries: [...map.entries()],
  setEntries: [...set.entries()],
});
