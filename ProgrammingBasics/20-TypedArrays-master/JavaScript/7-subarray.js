"use strict";

const arr8 = new Int8Array(10);

for (let i = 0; i < 10; i++) {
  arr8[i] = i;
}

console.log(arr8);
console.log(arr8.subarray(1));
console.log(arr8.subarray(3, 7));
console.log(arr8.slice(1));
console.log(arr8.slice(3, 7));
