"use strict";

const buffer = new SharedArrayBuffer(40);

const array = new Uint32Array(buffer);
console.dir({ array });

const res = Atomics.store(array, 5, 123);
console.dir({ res });

const val = Atomics.load(array, 5);
console.dir({ val });
