"use strict";

// Типизированный массив в отличии от обычного массива хранит данные только одного типа.

// Выделяем массив на 10 байт.
const arrayBuffer = new ArrayBuffer(10);

console.dir(arrayBuffer); // ArrayBuffer { byteLength: 10 } // Показывает сколько байтов выделено на массив.
console.log(arrayBuffer.byteLength); // 10
console.log(typeof arrayBuffer); // Object
console.log(arrayBuffer instanceof ArrayBuffer); // true // Проверяем тип массива.
console.log(Object.getPrototypeOf(arrayBuffer).constructor.name); // ArrayBuffer // Тоже самое.

const ui8a = new Uint8Array(); // Массив без знаковых чисел на 8 байт.
console.log(ArrayBuffer.isView(ui8a)); // true // Метод говорит является ли другой типизированный массив возможным
                                               // вью для буфера.
