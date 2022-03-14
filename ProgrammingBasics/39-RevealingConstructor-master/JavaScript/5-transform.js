"use strict";

const fs = require("fs");
const { Transform } = require("stream");

class UpperStream extends Transform {
  _transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  }
}

const upperStream = new UpperStream();

const source = fs.createReadStream("./5-transform.js");
source.pipe(upperStream).pipe(process.stdout);
