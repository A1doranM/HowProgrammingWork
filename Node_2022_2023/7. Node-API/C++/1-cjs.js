"use strict";

// Для того чтобы получить нужный файл надо выполнить инструкцию из ридми файла

const example = require("./build/Release/example.node");

const sum = example.add(3, 7);
console.log({ sum });

const res = example.addCallback(3, 7, (error, data) => {
  console.log({ data });
  return "done";
});
console.log({ res });
