"use strict";

const arr8 = new Int8Array(10);

// new Int8Array([1, 2, 3])
// new Int8Array(buffer)

for (let i = 0; i < 10; i++) {
  arr8[i] = i;
}

console.dir({
  arr8,
  length: arr8.length,
  buffer: arr8.buffer,
  byteLength: arr8.byteLength,
  byteOffset: arr8.byteOffset,
});

console.log(...arr8);

for (const a of arr8) {
  console.log("Element value: " + a);
}

const arr32 = new Int32Array(arr8);
console.dir(arr32);
arr32[2] = 7;
console.dir({ arr8, arr32 });

const view1 = new DataView(arr32.buffer, 2, 5);
console.dir(view1);
