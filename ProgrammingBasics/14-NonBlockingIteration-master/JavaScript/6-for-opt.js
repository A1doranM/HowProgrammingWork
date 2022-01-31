"use strict";

// Оптимизированный for await отдающий время в ивентлуп каждые 10 мсек.

const INTERVAL = 10;

const range = {
  start: 1,
  end: 1000,
  [Symbol.asyncIterator]() {
    let time = Date.now();
    let value = this.start;
    return {
      next: () => {
        const now = Date.now();
        const diff = now - time;
        if (diff > INTERVAL) { // Проверяем не случился ли интервал
          time = now; // сбрасываем время
          return new Promise(resolve => {
            setTimeout(() => { // Резолваем промис через таймаут
              resolve({
                value, // значение
                done: value++ === this.end + 1 // флаг завершения итерации.
              });
            }, 0);
          });
        }
        return Promise.resolve({ // Если не случился резолваем промис сразу
          value, // со значением
          done: value++ === this.end + 1 // и переменной, говорящей о том завершена ли итерация.
        });
      }
    };
  }
};

console.dir({
  range,
  names: Object.getOwnPropertyNames(range),
  symbols: Object.getOwnPropertySymbols(range),
});

let k = 0;

const timer = setInterval(() => {
  console.log("next ", k++);
}, 10);

(async () => {
  const begin = process.hrtime.bigint();
  for await (const number of range) {
    console.log(number);
    if (number === range.end) {
      clearInterval(timer);
    }
  }
  const diff = (process.hrtime.bigint() - begin) / 1000000n;
  console.log("Time(ms):", diff.toString());
  console.dir({ k });
})();
