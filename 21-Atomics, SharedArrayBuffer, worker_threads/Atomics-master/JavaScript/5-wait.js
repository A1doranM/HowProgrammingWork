"use strict";

// Atomics.wait(typedArray, index, value[, timeout])
// Returns: "ok" | "not-equal" | "timed-out"

const buffer = new SharedArrayBuffer(40);

const array = new Int32Array(buffer);
console.dir({ array });

const w1 = Atomics.wait(array, 5, 0, 1000);
console.dir({ w1 });

const w2 = Atomics.wait(array, 5, 111);
console.dir({ w2 });

setTimeout(() => {
  Atomics.store(array, 5, 222);
  console.log(Atomics.notify(array, 5, 1));
}, 2000);

console.dir({ array });
