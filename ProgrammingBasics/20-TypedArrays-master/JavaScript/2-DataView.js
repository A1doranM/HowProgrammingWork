"use strict";

const len = 1024;
const buffer = new ArrayBuffer(len); // Создаем массив размером 1кб.
const view1 = new DataView(buffer); // Создаем вьюшки для буфера. 1 аргумент - смещение, а второй это сколько бай взять.
const view2 = new DataView(buffer, 8, 24); // view 24 bytes from offset 8
const view3 = new DataView(buffer, 128, 16); // view 16 bytes from offset 128

// По вью можно проходиться по и работать с ним, ставя, или удаляя элементы.
for (let i = 0; i < len; i++) {
  const value = (i + 7) * 5;
  view1.setUint8(i, value); // Устанавливаем значение в определенную позицию.
}

console.dir({ view1, view2, view3 });

// Цифры после названия метода, или названия массива, означают сколько бит занимает считываемое число
// Например getUint8 означает что надо считать 8 бит и записать их как целое без знаковое число.
console.dir({
  int16view1: view1.getInt16(10), // offset 10 bytes
  int16view2: view2.getInt16(10), // offset 10 + 8 = 18 bytes
  int32view1: view1.getInt32(10), // offset 10 bytes

  int8view1:  view1.getInt8(20),
  uint8view1: view1.getUint8(20),

  // Считываем инт32 начиная со смещения в 5 байтов.
  int32view1BE: view1.getInt32(5),       // big-endian
  int32view1LE: view1.getInt32(5, true), // little-endian

  // toString(16) переведет возвращенное число в 16-ричную систему.
  int32view1BEhex: view1.getInt32(5).toString(16),       // 3C 41 46 4B
  int32view1LEhex: view1.getInt32(5, true).toString(16), // 4B 46 41 3C


  int8view1f: view1.getInt8(5).toString(16), // 3C
});
