"use strict";

// В данном уроке рассматривается создание возможности для отмены асинхронных
// операций.

const cancelable = (fn) => {
  const wrapper = (...args) => { // Захватываем функцию.
    if (fn) return fn(...args); // Если функцию передали, вызываем ее.
  };
  wrapper.cancel = () => fn = null; // Примешиваем к функции метод обнуляющий ссылку на нее.
  return wrapper;
};

// Usage

const fn = (par) => {
  console.log("Function called, par:", par);
};

const f = cancelable(fn);
f("first");
f.cancel();
f("second");
