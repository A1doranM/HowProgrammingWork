"use strict";

// Встроенный в JS сериализатор.

const obj1 = {
  field: "Value",
  subObject: {
    arr: [7, 10, 2, 5],
    fn: (x) => x / 2
  }
};

const s = JSON.stringify(obj1);
console.log(s);
const obj2 = JSON.parse(s);
console.log(obj2);
