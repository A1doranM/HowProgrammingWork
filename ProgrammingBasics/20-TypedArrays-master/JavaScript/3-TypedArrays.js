"use strict";

// Все вью для создания типизированных массивов.
const types = [
  Int8Array, Uint8Array, Uint8ClampedArray,
  Int16Array, Uint16Array,
  Int32Array, Uint32Array,
  BigInt64Array, BigUint64Array,
  Float32Array, Float64Array,
];

// Выводим сколько байт отводится для хранения каждого элемента массива.
const size = types.map((typedArray) => typedArray.BYTES_PER_ELEMENT);

console.dir({
  types,
  size
});
