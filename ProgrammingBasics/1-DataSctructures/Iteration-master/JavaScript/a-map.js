"use strict";

const log = (s, i) => {
  console.log(i, s);
  return s;
};

const f1 = (x) => x * 2;
const f2 = (x) => ++x;

// Композиция. Собираем переданные функции и выполняем их одну за другой.
const compose = (...funcs) => (x) => funcs.reduce((v, f) => f(v), x);

const f3 = compose(f1, f2);

const res1 = [7, 10, 1, 5, 2] // Есть масиив.
  .filter((x) => x > 4) // Применяем фильтр который вернет все значения больше 4.
  .map(f3) // Применяем функцию ф3.
  .reduce((acc, val) => acc + val); // Редьюс приводит весь массив к одному элементу. В данном случае суммируем массив.

console.log(res1);
console.log();

[7, 10, 1, 5, 2]
  .map(log)
  .map((x) => x * 2)
  .map(log)
  .map((x) => ++x)
  .map(log);
