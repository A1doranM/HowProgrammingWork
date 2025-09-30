"use strict";

// Synchronous function to callback-last

// Делаем функцию асинхронной, асинхронность на коллбэках.
const asyncify = (fn) => (...args) => {
  const callback = args.pop(); // Забираем коллбэк из переданным нам аргументам. По контракту коллбэк идет последним.
  setTimeout(() => {
    try {
      const result = fn(...args);
      if (result instanceof Error) callback(result); // Если произошла ошибка отдаем ее.
      else callback(null, result); // Иначе отдадим результат, а первым аргументом null.
    } catch (error) {
      callback(error);
    }
  }, 0);
};

// Usage

const twice = (x) => x * 2;
const twiceAsync = asyncify(twice);

const half = (x) => x / 2;
const halfAsync = asyncify(half);

const result = half(twice(100));
console.dir({ sync: result });

twiceAsync(100, (e, value) => {
  halfAsync(value, (e, result) => {
    console.dir({ asyncified: result });
  });
});
