"use strict";

// Сокращенный вариант через редьюс.
// Тут небольшой оверхед в том что изначальный X мы должны обернуть в Промис
// чтобы дальше иметь возможность у аккумулятора вызывать then acc.then(f).
const compose = (...fns) => (x) => fns
  .reduce((acc, f) => acc.then(f), Promise.resolve(x));

// Usage

const inc = async (x) => x + 1;
const twice = async (x) => x * 2;
const square = async (x) => x * x;

const f = compose(inc, twice, square, inc);

(async () => {
  const res = await f(7);
  console.dir({ res });
})();
