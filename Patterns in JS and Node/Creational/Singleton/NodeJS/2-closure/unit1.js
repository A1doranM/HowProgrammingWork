'use strict';

const fs = require('node:fs');

const { readFile } = fs;

let calls = 0;
let callbacks = 0;

fs.readFile = (fileName, callback) => {
  calls++;
  console.log('call');
  readFile(fileName, (error, data) => {
    callbacks++;
    console.log('callback');
    callback(error, data);
  });
};

module.exports = () => {
  console.log('unit1');
  console.log({ calls, callbacks });
  return { calls, callbacks };
};
