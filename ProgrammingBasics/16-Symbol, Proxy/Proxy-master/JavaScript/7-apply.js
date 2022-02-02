"use strict";

const max = (a, b) => (a > b ? a : b);

const amax = new Proxy(max, { // Прокси может оборачивать так же функции
  apply(target, context, args) { // для них мы например можем перехватывать вызов apply.
    console.log("apply", target.name, args);
    return args.reduce(target);
  }
});

console.log(max(7, 3, 12, 5, 0, 4, 8, 5));
console.log(amax(7, 3, 12, 5, 0, 4, 8, 5));
