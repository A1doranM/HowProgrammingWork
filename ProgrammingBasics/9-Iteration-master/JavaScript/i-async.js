"use strict";

const range = {
  start: 1,
  end: 1000,
  [Symbol.asyncIterator]() {
    let value = this.start;
    return {
      next: () => new Promise((resolve, reject) => { // Пример с реально асинхронным итератором в котором мы
        setTimeout(() => { // резолваем промис внутри таймаута что позволяет отдавать кванты времени процессору и
          resolve({ // не блокировать основной поток.
            value,
            done: value++ === this.end + 1
          });
        }, 0);
      })
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
  for await (const number of range) {
    console.log(number);
  }
  clearInterval(timer);
})();
