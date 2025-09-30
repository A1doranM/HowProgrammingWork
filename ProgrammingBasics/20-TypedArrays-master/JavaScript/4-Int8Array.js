"use strict";

const arr8 = new Int32Array(10); //

// new Int8Array([1, 2, 3]) // Таким образом мы сконвертируем обычный массив в 8-битный.
// new Int8Array(buffer)

for (let i = 0; i < 10; i++) {
  arr8[i] = i;
}

// Если при создании массива мы не передавали ему объект буфера то он автоматически создаст его
// доступ к буферу можно получить через свойства ниже.
console.dir({
  arr8,
  length: arr8.length, // Длина массива.
  buffer: arr8.buffer, // Буфер в котором хранится массив.
  byteLength: arr8.byteLength, // Длина буфера.
  byteOffset: arr8.byteOffset, // Смещение.
});

console.log(...arr8);

for (const a of arr8) {
  console.log("Element value: " + a);
}

const arr32 = new Int32Array(arr8); // Копирует все данные из первого массива в новый 32 битный,
                                    // а вот если написать arr8.buffer то массивы свяжутся между собой, и все что будет
                                    // писаться в первый массив запишется и во второй.
console.dir(arr32);
arr32[2] = 7;
console.dir({ arr8, arr32 });

const view1 = new DataView(arr32.buffer, 2, 5);
console.dir(view1);
