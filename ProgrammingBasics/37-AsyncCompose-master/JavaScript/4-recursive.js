"use strict";

// Композиция любого числа функций при помощи рекурсии.

const compose = (...fns) => (x, callback) => {
  const fn = fns.shift();
  if (fns.length === 0) { // Заканчиваем когда вызвали все функции.
    fn(x, callback); // Вызывае последднюю функцию отдавая ей аргумент и коллбэк.
    return; // Завершаем выполнение.
  }
  fn(x, (err, res) => {
    if (err) { // Если ошибка.
      callback(err);
      return; // Тоже заканчиваем.
    }
    const f = compose(...fns); // Иначе опять вызываем композицию для всех оставшихся функций.
    f(res, callback); // Вызываем функцию.
  });
};

// Usage

const inc = (x, callback) => callback(null, x + 1);
const twice = (x, callback) => callback(null, x * 2);
const square = (x, callback) => callback(null, x * x);

const f = compose(inc, twice, square, inc); // 257

f(7, (err, res) => {
  console.log({ res });
});
