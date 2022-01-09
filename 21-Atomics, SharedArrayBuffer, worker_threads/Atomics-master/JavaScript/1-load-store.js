"use strict";

const buffer = new SharedArrayBuffer(40);

const array = new Uint32Array(buffer);
console.dir({ array });

const res = Atomics.store(array, 5, 123); // Атомарная операция записывает в 5 ячейку массива число 123 и возвращает то что было записанно до этого.
console.dir({ res });

const val = Atomics.load(array, 5); // Читаем из ячейки массива.
console.dir({ val });
