"use strict";

console.log(Function);

const AsyncFunction = (async () => {}).constructor;
console.log(AsyncFunction);

const fn = () => {};
const afn = async () => {};

console.dir({
  fn: typeof fn, // Тип обычной функции Function.
  afn: typeof afn, // Тип асинхронной тоже Function.
});

console.log(fn instanceof Function); // Вернет true
console.log(afn instanceof Function); // тоже самое
console.log(fn instanceof AsyncFunction); // вернет false
console.log(afn instanceof AsyncFunction); // вернет true.

console.log(afn.__proto__.constructor); // Прото отдаст конструктор AsyncFunction
console.log(afn.__proto__.__proto__.constructor); // прото у прото отдаст Function
console.log(afn.__proto__.__proto__.__proto__.constructor); // и последний прото отдаст Object.

console.log();

console.log(Object.getPrototypeOf(afn).constructor); // Тоже самое что и через proto выше, но это нормальный способ доступа к прототипам.
console.log(
  Object.getPrototypeOf(
    Object.getPrototypeOf(afn)).constructor);
console.log(
  Object.getPrototypeOf(
    Object.getPrototypeOf(
      Object.getPrototypeOf(afn))).constructor);
