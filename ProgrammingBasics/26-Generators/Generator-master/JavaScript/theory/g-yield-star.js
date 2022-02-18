"use strict";

// Возврат из генератора через yield со звездочкой.
function* genFn() {
  yield* [10, 20, 30]; // Такой yield позволяет возвращать из себя итерируемые объекты.
                       // без нее просто вернется весь массив целиком, а так итерация пойдет по массиву где
                       // через next() мы уже будем получать элементы массива.
  //yield* new Set([10, 20, 30]);
}

const c = genFn();
const val1 = c.next();
const val2 = c.next();
const val3 = c.next();
const val4 = c.next();
console.log({ c, val1, val2, val3, val4 });
