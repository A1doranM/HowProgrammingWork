"use strict";

const range = {
  start: 1,
  end: 10,
  [Symbol.iterator]() { // Символ итератор который позволяет задать функцию которая будет вызываться если
                        // мы используем spread оператор, или цикл for.
    let value = this.start;
    return { // Итератор должен возвращать объект с методом next(),
             // который в свою очередь возвращает значение, и флаг done
             // который будет говорить о том есть ли еще что итерировать.
      next: () => ({
        value,
        done: value++ === this.end + 1
      })
    };
  }
};

console.dir({
  range,
  names: Object.getOwnPropertyNames(range),
  symbols: Object.getOwnPropertySymbols(range),
});

for (const number of range) {
  console.log(number);
}

const sum = (prev, cur) => prev + cur;
const sumIterable = (...iterable) => iterable.reduce(sum);

const sumRange = sumIterable(...range);
console.log("sumRange:", sumRange);
