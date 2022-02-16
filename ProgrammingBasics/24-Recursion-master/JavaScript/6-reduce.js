"use strict";

const reduce = (fn, acc, [cur, ...rest]) => (
  cur === undefined ? acc : reduce(fn, fn(acc, cur), rest)
);

const res = reduce((a, b) => a + b, 0, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
console.log({ res });
