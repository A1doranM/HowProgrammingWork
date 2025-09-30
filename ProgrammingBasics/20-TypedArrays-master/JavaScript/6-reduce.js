"use strict";

const arr8 = new Int8Array(10);

for (let i = 0; i < 10; i++) {
  arr8[i] = i;
}

const reduced = arr8.reduce((acc, el) => acc + el);
console.dir({
  reduced,
  type: typeof reduced,
});
