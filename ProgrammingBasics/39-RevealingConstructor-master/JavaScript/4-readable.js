"use strict";

const crypto = require("crypto");
const { Readable } = require("stream");

// А вот так это делается с применением открытого конструктора
// в конструктор Readable передаем объект который переопределит
// метод read.

const randomStream = new Readable({
  read(size = 1) {
    const buffer = Buffer.alloc(size);
    crypto.randomFillSync(buffer);
    this.push(buffer.toString("hex"));
  }
});

const data = randomStream.read(10);
console.log(data);

//randomStream.pipe(process.stdout);
