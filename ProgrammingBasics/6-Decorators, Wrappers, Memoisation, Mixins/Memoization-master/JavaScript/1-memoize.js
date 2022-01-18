"use strict";

// Мемоизация это тоже обертка но которая умеет кешировать результаты функции которую она обернула.
const argKey = x => x.toString() + ":" + typeof x;
const generateKey = args => args.map(argKey).join("|"); // Функция для создания ключа по аргументам, например
                                                              // пришло (1, 2, а), получим "1|2|a".

const memoize = fn => {
  const cache = Object.create(null); // Создаем пустой объект который будет нашим кешем.
  return (...args) => { // Возвращаем функцию.
    const key = generateKey(args); // Генерируем ключ.
    const val = cache[key];  // Забираем значения по ключу.
    if (val) return val; // Если есть значение то возвращаем его.
    const res = fn(...args); // Иначе исполняем функцию.
    cache[key] = res; // Кешируем результат.
    return res; // Отдаем его.
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
