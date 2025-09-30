"use strict";

const obj1 = {
  "Marcus Aurelius": "121-04-26",
  "Commodus Antoninus": "161-08-31",
  "Victor Glushkov": "1923-08-24",
};

const obj2 = {
  "Ibn Arabi": "1165-11-16",
  "Mao Zedong": "1893-12-26",
  "Rene Descartes": "1596-03-31",
};

const objConcat1 = Object.assign({}, obj1, obj2);
const objConcat2 = { ...obj1, ...obj2 };

console.dir({ objConcat1, objConcat2 });
