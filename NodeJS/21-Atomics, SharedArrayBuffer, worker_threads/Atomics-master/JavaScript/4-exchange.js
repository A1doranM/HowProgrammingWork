"use strict";

// Atomics.exchange(typedArray, index, value)
// Atomics.compareExchange(typedArray, index, expectedValue, replacementValue)

const buffer = new SharedArrayBuffer(40);

const array = new Uint32Array(buffer);
console.dir({ array });

const prev1 = Atomics.exchange(array, 5, 111); // Забирает старое значение и записывает новое, возвращая предыдущее значение.
console.dir({ prev1 });

const prev2 = Atomics.compareExchange(array, 5, 111, 222); // Проверяет если в ячейке число 111 то запишем туда 222, а если нет то ничего не запишем.
                                                                                          // Возвращает предыдущее значение ячейки.
console.dir({ prev2 });

const prev3 = Atomics.compareExchange(array, 5, 111, 333);
console.dir({ prev3 });

console.dir({ array });
