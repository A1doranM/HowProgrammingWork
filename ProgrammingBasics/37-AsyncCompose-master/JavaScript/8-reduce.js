"use strict";

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
