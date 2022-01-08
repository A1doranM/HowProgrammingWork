"use strict";

const buffer = new SharedArrayBuffer(40);

const array = new Uint32Array(buffer);
console.dir({ array });

const prevXor = Atomics.xor(array, 5, 0b11110000);
console.dir({ prevXor: prevXor.toString(2) });

const prevOr = Atomics.or(array, 5, 0b1111);
console.dir({ prevOr: prevOr.toString(2) });

const prevAnd = Atomics.and(array, 5, 0b10101010);
console.dir({ prevAnd: prevAnd.toString(2) });
console.dir({ result: array[5].toString(2) });

console.dir({ array });
