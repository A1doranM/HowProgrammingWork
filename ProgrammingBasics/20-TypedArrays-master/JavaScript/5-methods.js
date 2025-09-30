"use strict";

const arr8 = new Int8Array(10);

for (let i = 0; i < 10; i++) {
  arr8[i] = i;
}

const mapped = arr8.map((el) => el * 2);
console.dir(mapped);

console.dir([
  arr8.indexOf(2),
  arr8.lastIndexOf(10),
  arr8.reverse(),
  arr8.slice(2, 7),
]);
