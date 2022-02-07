"use strict";

const types = [
  Int8Array, Uint8Array, Uint8ClampedArray,
  Int16Array, Uint16Array,
  Int32Array, Uint32Array,
  Float32Array,
  Float64Array
];

const size = types.map((typedArray) => typedArray.BYTES_PER_ELEMENT);

console.dir({
  types,
  size
});
