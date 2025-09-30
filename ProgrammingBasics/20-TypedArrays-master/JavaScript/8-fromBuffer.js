"use strict";

// Пример со сцепкой двух типизированных массивов, в
// один читаем в другой пишем.

const buffer = new ArrayBuffer(10);

// В первом будет 10 элементов, а во втором 5 потому что
// 16 битный массив жрет 2 байта на элемент.

const ai8 = new Int8Array(buffer); // Первый ссылается на буфер.
const au16 = new Uint16Array(buffer); // Второй ссылается на буфер.

console.dir({
  ai8,
  au16
});

for (let i = 0; i < ai8.length; i++) {
  ai8[i] = i;
}

console.dir({
  ai8,
  au16
});
