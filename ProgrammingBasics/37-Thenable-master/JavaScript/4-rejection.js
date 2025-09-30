"use strict";

// Более полный пример
const getNumbers = () => ({
  numbers: [1, 2, 3],
  then(onFulfilled, onRejected) { // добавлен второй аргумент который должен быть у then, onRejected.
    const num = this.numbers.shift(); // Суть. Каждый раз забираем что-то из массива
    if (num) { // если получилось, ок.
      onFulfilled(num);
    } else { // Если нет то rejected.
      onRejected(new Error("I have no numbers for you"));
    }
  }
});

// Usage

(async () => {
  const next = getNumbers();
  for (let i = 0; i < 5; i++) {
    try {
      const res = await next;
      console.dir({ res });
    } catch (err) {
      console.dir({ err: err.message });
    }
  }
})();
