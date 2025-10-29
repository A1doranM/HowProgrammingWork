'use strict';

const fs = require('node:fs');

const { readFile } = fs;

fs.readFile = (fileName, callback) => {
  fs.readFile.calls++;
  readFile(fileName, (error, data) => {
    fs.readFile.callbacks++;
    callback(error, data);
  });
};

fs.readFile.calls = 0;
fs.readFile.callbacks = 0;
