"use strict";

// Пример с более приближенным к реальности генератором.
// Генерируем числа начиная с begin до end с шагом delta.
function* counter(begin, end, delta = 1) {
  let value = begin;
  while (end > value) { // Крутим цикл пока end больше value
    value += delta; // увеличиваем число.
    if (value > end) return; // Когда превысили end выходим из генератора при помощи return
    yield value; // пока не дошли до енд возвращаем значения через yield.
  }
}

const c = counter(0, 30, 12);
const val1 = c.next();
const val2 = c.next();
const val3 = c.next();
const val4 = c.next();
console.log({ c, val1, val2, val3, val4 });
