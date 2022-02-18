"use strict";

// Generator function
// Асинхронные генераторы
// Файлы 2, 3, 4. Я удалил так как они повторяют код синхронного генератора.
function* genFn(x) {
  yield x * 2;
  return x * 3;
}

async function* asyncGenFn(x) {
  yield x * 2;
  return x * 3;
}

const asyncGenFn2 = async function* (x) {
  yield x * 2;
  return x * 3;
};

console.log("asyncGenFn =", [asyncGenFn]);
console.log("asyncGenFn.toString() =", [asyncGenFn.toString()]);
console.log("typeof asyncGenFn =", typeof asyncGenFn);
const fnProto = Object.getPrototypeOf(asyncGenFn);
console.log("fnProto.constructor.name =", fnProto.constructor.name);

console.log("typeof asyncGenFn(5) =", typeof asyncGenFn(5));
console.log("asyncGenFn(5).toString() =", asyncGenFn(5).toString());
const genProto = Object.getPrototypeOf(asyncGenFn(5));
console.log("genProto =", genProto);
console.log("genProto[Symbol.asyncIterator] =", genProto[Symbol.asyncIterator]);

console.log("asyncGenFn(5) =", asyncGenFn(5));
console.log("asyncGenFn(5).next() =", asyncGenFn(5).next());
console.log("asyncGenFn(5).next().value =", asyncGenFn(5).next().value);
