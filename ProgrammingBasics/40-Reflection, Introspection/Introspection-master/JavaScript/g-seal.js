"use strict";

const object = {
  a: 1,
  [Symbol("d")]: 4,
};
object.b = 2;
console.log(Object.isSealed(object));
Object.seal(object);
console.log(Object.isSealed(object));
//object.c = 3;
//object[Symbol("e")] = 5;
object.a = 0;
console.dir({ object });

console.log();
const array = [1, 2, 3];
array.push(4);
console.log(Object.isSealed(array));
Object.seal(array);
console.log(Object.isSealed(array));
//array.push(5);
//array.key = 6;
array[0] = 0;
console.dir({ array });
