"use strict";

// Более продвинутый пример где мы каждые 10 мсек отдаем квант времени
// в ивентлуп.

const INTERVAL = 10;

const numbers = new Array(1000).fill(1);

const each = (array, fn) => {
  let time = Date.now(); // Время в начале итерации.
  let i = 0;
  const last = array.length - 1;

  const next = () => {
    while (i <= last) { // Пока не последний элемент.
      const now = Date.now();
      const diff = now - time;
      if (diff > INTERVAL) { // Если время превысило интервал
        time = now; // сбрасываем время начала итерации на текущее
        setTimeout(next, 0); // Запускаем новый цикл исполнения next.
        break; // Прекращаем текущий цикл.
      }
      fn(array[i], i++); // Иначе вызываем обработчик, заодно увеличивая i на 1.
      // Таким образом на большинстве итераций будет просто вызываться функция, и периодически
      // будет срабатывать setTimeout прерывающий итерацию.
    }
  };

  next();
};

let k = 0;

const timer = setInterval(() => {
  console.log("next ", k++);
}, 10);

const begin = process.hrtime.bigint();

each(numbers, (item, i) => {
  console.log(i);
  if (i === 999) {
    clearInterval(timer);
    const diff = (process.hrtime.bigint() - begin) / 1000000n;
    console.log("Time(ms):", diff.toString());
    console.dir({ k });
  }
});
