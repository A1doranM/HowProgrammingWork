"use strict";

// Не блокирующее итерирование.

const numbers = new Array(1000).fill(1);

// Сделали функцию each которая проходит по массиву.
const each = (array, fn) => {
  const last = array.length - 1; // Ссылка на последний элемент.
  const next = i => { // Рекурсивная функция итерации
    setTimeout(() => { // запускает таймер
      fn(array[i], i); // выполняем коллбэк
      if (i !== last) next(++i); // если не последний элемент запускаем функцию next на следующем элементе.
    }, 0);
  };
  next(0); // Вызываем next на первом элементе, и дальше она пойдет по всем остальным.
};

let k = 0;

const timer = setInterval(() => {
  console.log("next ", k++);
}, 10);

const begin = process.hrtime.bigint();

each(numbers, (item, i) => {
  console.log(i);
  if (i === 999) {
    clearInterval(timer);
    const diff = (process.hrtime.bigint() - begin) / 1000000n;
    console.log("Time(ms):", diff.toString());
  }
});
