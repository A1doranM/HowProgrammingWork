"use strict";

const buffer = new ArrayBuffer(10);

const ai8 = new Int8Array(buffer);
const au16 = new Uint16Array(buffer);

console.dir({
  ai8,
  au16
});

for (let i = 0; i < ai8.length; i++) {
  ai8[i] = i;
}

console.dir({
  ai8,
  au16
});
