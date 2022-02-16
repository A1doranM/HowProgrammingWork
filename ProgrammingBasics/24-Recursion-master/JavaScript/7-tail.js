"use strict";

// Пример хвостовой рекурсии.

const add = (n, acc = 0) => {
  if (n === 0) return acc;
  return add(n - 1, acc + n); // Хвостовая рекурсия частный случай рекурсии,
                                     // при котором любой рекурсивный вызов является последней операцией перед возвратом из функции.
};

console.log(add(3));

const tail = (n, acc = 0) => {
  while (true) {
    if (n === 0) return acc;
    acc += n;
    n -= 1;
  }
};

console.log(tail(3));
