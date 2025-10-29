'use strict';

const fs = require('node:fs');

fs.readFile('./main.js', (error, data) => {
  if (error) {
    console.log({ error });
  } else {
    console.log({ data });
  }
});

module.exports = () => {
  console.log('unit2');
};
