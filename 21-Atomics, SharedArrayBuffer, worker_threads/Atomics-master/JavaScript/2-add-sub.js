"use strict";

const buffer = new SharedArrayBuffer(40);

const array = new Uint32Array(buffer);
console.dir({ array });

const prevAdd = Atomics.add(array, 5, 321);
console.dir({ prevAdd });

const prevSub = Atomics.sub(array, 5, 123);
console.dir({ prevSub });

console.dir({ array });
