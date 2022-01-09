"use strict";

const buffer = new SharedArrayBuffer(40);

const array = new Uint32Array(buffer);
console.dir({ array });

const prevAdd = Atomics.add(array, 5, 321); // Берет число в которое было в ячейке 5, к нему добавляет 321, записывает в ячейку и возвращает предидущее число.
console.dir({ prevAdd });

const prevSub = Atomics.sub(array, 5, 123); // Берет число в которое было в ячейке 5, и вычитает из него 132, записывает в ячейку и возвращает предидущее число.
console.dir({ prevSub });

console.dir({ array });
