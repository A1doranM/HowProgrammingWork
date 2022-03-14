"use strict";

const crypto = require("crypto");
const { Readable } = require("stream");

class RandomStream extends Readable {
  _read(size = 1) {
    const buffer = Buffer.alloc(size);
    crypto.randomFillSync(buffer);
    this.push(buffer.toString("hex"));
  }
}

const randomStream = new RandomStream();

const data = randomStream.read(10);
console.log(data);

//randomStream.pipe(process.stdout);
