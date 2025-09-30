"use strict";

const arr1 = [
  "Marcus Aurelius",
  "Commodus Antoninus",
  "Victor Glushkov",
];

const arr2 = [
  "Ibn Arabi",
  "Mao Zedong",
  "Rene Descartes",
];

const arrConcat1 = arr1.concat(arr2);
const arrConcat2 = [...arr1, ...arr2];

console.dir({ arrConcat1, arrConcat2 });
