"use strict";

// Единицей оптимизаии в джаваскрипте я вляется функция
// и код написанный просто простыней, либо оптимизируется весь,
// либо не оптимизируется, поэтому свои примеры мы оборачиваем в
// функцию.
// Тогда решения об оптимизации принимается на уровне функции, это делается
// потому что у функций есть контекст в рамках которого можно оптимизировать.
// Из функции желательно что-то возвращать и потом использовать поскольку иначе компидятор
// может просто посчитать что это бесполезная функция и вовсе не вызвать ее.


const LOOP_COUNT = 50000;

const fn = () => {
  const a = [];
  for (let i = 0; i < LOOP_COUNT; i++) {
    a.push(Array(i).join("A").length);
  }
  return a;
};

console.log();

console.time("experiment");
const res1 = fn();
console.log("res1.length", res1.length);
console.timeEnd("experiment");

console.log();

// Бенчмаркинг с помощью даты.
const begin2 = new Date().getTime();
const res2 = fn();
const end2 = new Date().getTime();
const diff2 = end2 - begin2;
console.dir({ length: res2.length, diff: diff2 });

console.log();

// Бенчмаркинг при помощи hrtime.
const begin3 = process.hrtime(); // Возвращает специальных high resolution timer, который представляет собой два числа.
const res3 = fn();
const end3 = process.hrtime(begin3); // Получаем разницу между началом и концом.
const diff3 = end3[0] * 1e9 + end3[1]; // Старщее значение умножаем на 10 в 9 степени и
                                       // дальше младшую часть приклеиваем туда.
const sec3 = diff3 / 1e9; // Делим дифф и получаем количество мсек.
console.dir({ length: res3.length, msec: diff3, sec: sec3 });
