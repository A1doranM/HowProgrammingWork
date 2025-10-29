'use strict';

const crypto = require('node:crypto');
const { Readable } = require('node:stream');

const randomStream = new Readable({
  read(size = 1) {
    const buffer = Buffer.alloc(size);
    crypto.randomFillSync(buffer);
    this.push(buffer.toString('hex'));
  }
});

const data = randomStream.read(10);
console.log(data);

//randomStream.pipe(process.stdout);
