'use strict';

const fs = require('node:fs');
const { Transform } = require('node:stream');

const upperStream = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  }
});

const source = fs.createReadStream('./6-transform.js');
source.pipe(upperStream).pipe(process.stdout);
