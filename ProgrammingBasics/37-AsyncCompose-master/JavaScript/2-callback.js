"use strict";

// Композиция с коллбэком.

const compose = (f1, f2) => (x, callback) => {
  f1(x, (err, res) => {
    if (err) { // Если случилась ошибка
      callback(err); // отдаем ее в коллбэк
      return; // и заканчиваем на этом
    }
    f2(res, callback); // если все хорошо то вызываем следующую функцию.
  });
};

// Usage

const inc = (x, callback) => callback(null, x + 1);
const twice = (x, callback) => callback(null, x * 2);

const f = compose(inc, twice);

f(7, (err, res) => {
  console.log({ res });
});
