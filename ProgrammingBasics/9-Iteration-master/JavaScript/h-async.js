"use strict";

const range = {
  start: 1,
  end: 1000,
  [Symbol.asyncIterator]() { // Асинхронный итератор делает все что и обычный но он используется внутри цикла
                             // for await
    let value = this.start;
    return {
      next: () => Promise.resolve({ // он должен возвращать зарезолваный промис с такими же данными как и обычный
                                          // итератор. Но такое итерированние все еще блокирующее.
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
