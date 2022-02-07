"use strict";

const len = 1024;
const buffer = new ArrayBuffer(len);
const view1 = new DataView(buffer);
const view2 = new DataView(buffer, 8, 24); // view 24 bytes from offset 8
const view3 = new DataView(buffer, 128, 16); // view 16 bytes from offset 128

for (let i = 0; i < len; i++) {
  const value = (i + 7) * 5;
  view1.setUint8(i, value);
}

console.dir({ view1, view2, view3 });

console.dir({
  int16view1: view1.getInt16(10), // offset 10 bytes
  int16view2: view2.getInt16(10), // offset 10 + 8 = 18 bytes
  int32view1: view1.getInt32(10), // offset 10 bytes

  int8view1:  view1.getInt8(20),
  uint8view1: view1.getUint8(20),

  int32view1BE: view1.getInt32(5),       // big-endian
  int32view1LE: view1.getInt32(5, true), // little-endian

  int32view1BEhex: view1.getInt32(5).toString(16),       // 3C 41 46 4B
  int32view1LEhex: view1.getInt32(5, true).toString(16), // 4B 46 41 3C

  int8view1f: view1.getInt8(5).toString(16), // 3C
});
