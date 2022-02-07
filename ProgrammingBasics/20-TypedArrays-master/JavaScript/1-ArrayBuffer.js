"use strict";

const arrayBuffer = new ArrayBuffer(10);

console.dir(arrayBuffer); // ArrayBuffer { byteLength: 10 }
console.log(arrayBuffer.byteLength); // 10
console.log(typeof arrayBuffer); // Object
console.log(arrayBuffer instanceof ArrayBuffer); // true
console.log(Object.getPrototypeOf(arrayBuffer).constructor.name); // ArrayBuffer

const ui8a = new Uint8Array();
console.log(ArrayBuffer.isView(ui8a)); // true
