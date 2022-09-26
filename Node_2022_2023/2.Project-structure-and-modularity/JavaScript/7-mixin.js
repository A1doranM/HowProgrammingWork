"use strict";

// Пример с примешиванием в модуль.

const fs = require("node:fs");
const { readFile } = fs;

// Подменяем родное чтение файлов на свое.
fs.readFile = (...args) => {
  const path = args.shift();
  const callback = args.pop();
  const options = args.pop() || {};
  console.log(`Intercepted call: fs.readFile("${path}")`);
  return readFile(path, options, (err, data) => {
    if (err) console.error(err);
    else console.log(`Data received: ${data.length}`);
    callback(err, data);
  });
};

fs.readFile("./7-mixin.js", (err, data) => {
  console.log({ err, data });
});
