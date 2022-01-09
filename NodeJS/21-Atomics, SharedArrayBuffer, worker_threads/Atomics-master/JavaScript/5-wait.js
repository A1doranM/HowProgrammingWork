"use strict";

// Atomics.wait(typedArray, index, value[, timeout])
// Returns: "ok" | "not-equal" | "timed-out"

const buffer = new SharedArrayBuffer(40);

const array = new Int32Array(buffer);
console.dir({ array });

const w1 = Atomics.wait(array, 5, 0, 1000); // Проверяет находится ли предполагаемое значение по ячейке. И ждет пока оно там не появится, но не дольше 1000мсек.
console.dir({ w1 });                                      // Если остался 0 вернет значение "timed-out".

const w2 = Atomics.wait(array, 5, 111); // Вообще не будет ждать, сразу проверит что значение не равно и вернет "not-equal".
console.dir({ w2 });

setTimeout(() => { // Ждем 2 сек.
  Atomics.store(array, 5, 222); // Записываем в 5 ячейку 222.
  console.log(Atomics.notify(array, 5, 1)); // Нотифай уведомит все процессы об изменении значения. Третий параметр определяет сколько процессов надо уведомить.
}, 2000);

console.dir({ array });
