"use strict";

const crypto = require("crypto");
const { Readable } = require("stream");

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
