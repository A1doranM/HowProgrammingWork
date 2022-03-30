"use strict";

const argKey = x => x.toString() + ":" + typeof x;
const generateKey = args => args.map(argKey).join("|");

// Функция мемоизации.

const memoize = fn => { // На вход принимаем функцию
  const cache = Object.create(null); // в замыкании храним кэш, создав его таким
                                     // образом мы получим пустой объект без предков.
  return (...args) => { // возвращаем нашу функцию
    const key = generateKey(args); // генерируем ключ для кэша по аргументам
    const val = cache[key]; // пытаемся забирать значение по ключу
    if (val) return val; // если получилось то возвращаем его.
    const res = fn(...args); // Иначе вызываем функцию и ее результат
    cache[key] = res; // записываем в кэш по ключу.
    return res;
  };
};

// Usage

const sumSeq = (a, b) => {
  console.log("Calculate sum");
  let r = 0;
  for (let i = a; i < b; i++) r += i;
  return r;
};

const mSumSeq = memoize(sumSeq);

console.log("First call mSumSeq(2, 5)");
console.log("Value:", mSumSeq(2, 5));

console.log("Second call mSumSeq(2, 5)");
console.log("From cache:", mSumSeq(2, 5));

console.log("Call mSumSeq(2, 6)");
console.log("Calculated:", mSumSeq(2, 6));
