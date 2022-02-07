"use strict";

const ai8 = new Int8Array(10);
const au16 = new Uint16Array(ai8.buffer);

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
