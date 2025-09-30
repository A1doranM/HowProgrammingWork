"use strict";

// Wrapper will prevent call after timeout

// Обертки добавляющие поведение. В данном случае таймаут на выполнение.
// Это можно использовать когда мы хотим дать какой-то функции какое-то время
// на выполнение которое не будет превышать определенное значение.
const timeout = (msec, f) => {
  let timer = setTimeout(() => { // Ставим таймер на установленное время и получаем ссылку на него.
    if (timer) console.log("Function timed out"); // если при срабатывании таймер
    timer = null; // Когда таймер сработает очищаем ссылку на него чтобы сборщик мусора мог его собрать.
  }, msec);
  return (...args) => { // Возвращаем функцию
    if (!timer) return; // если таймер уже щакончился
    clearTimeout(timer); // очищаем его,
    timer = null; // очищаем ссылку.
    return f(...args); // Возвращаем результат выполнения функции.
  };
};

// Usage

const fn = (par) => {
  console.log("Function called, par:", par);
};

const fn100 = timeout(100, fn);
const fn200 = timeout(200, fn);

setTimeout(() => {
  fn100("first");
  fn200("second");
}, 150);
