"use strict";

// Следуем принципу.

// Если сумматор вызывается с аргументом мы прибавляем значение, а если нет. То возвращаем тукущую сумму.
// Фактически теперь у функции есть два контракта один отдает данные, другой меняет их.
const adder = (value) => (x) => {
  if (x === undefined) return value;
  value += x;
};

const a1 = adder(2);

console.log(a1(7));
console.log(a1());
console.log(a1(3));
console.log(a1());
console.log(a1(8));
console.log(a1());
