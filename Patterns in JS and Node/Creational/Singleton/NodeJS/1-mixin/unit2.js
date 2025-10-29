'use strict';

const fs = require('node:fs');

fs.readFile('./main.js', (error, data) => {
  const { calls, callbacks } = fs.readFile;
  fs.readFile.callbacks = 0;
  if (error) {
    console.log({ error, calls, callbacks });
  } else {
    console.log({ data, calls, callbacks });
  }
});
