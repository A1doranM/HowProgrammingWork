"use strict";

// Асинхронный пул на основе предыдущего примера.

const duplicate = (factory, n) => (
  new Array(n).fill().map(() => factory())
);

const poolify = (factory, min, norm, max) => {
  let allocated = norm; // Количество выделенных элементов.
  const items = duplicate(factory, norm);
  const delayed = []; // Коллекция запросов на получение новых элементов.

  return (par) => {
    if (typeof par !== "function") { // Если нам передали не коллбэк .
      if (items.length < max) { // Если есть места в пуле
        const request = delayed.shift(); // забираем ждущие в очереди коллбэки
        if (request) { // если кто-то был в очереди
          const c1 = items.length;
          console.log(`${c1}->${c1} Recycle item, pass to delayed`);
          request(par); // отдаем ему элемент пула.
        } else { // Если никого не было
          const c1 = items.length;
          items.push(par); // складываем элемент в пул.
          const c2 = items.length;
          console.log(`${c1}->${c2} Recycle item, add to pool`);
        }
      }
      return; // Ничего не делаем если нет мест в пуле.
    }

    // Если передали коллбэк

    if (items.length < min && allocated < max) { // Вычисляем сколько еще можно аллокировать элементов
      const grow = Math.min(max - allocated, norm - items.length); // Сколько новых надо выделить.
      allocated += grow;
      const instances = duplicate(factory, grow); // Порождаем новые элементы.
      items.push(...instances); // Записываем их в пул.
    }
    const c1 = items.length;
    const res = items.pop(); // Забираем один элемент.
    const c2 = items.length;
    if (res) { // Если смогли взять из пула элемент отдаем в коллбэк взятый из очереди элемент.
      console.log(`${c1}->${c2} Get from pool, pass to callback`);
      par(res);
    } else { // Если из пула мы ничего не смогли взять.
      console.log(`${c1}->${c2} Get from pool, add callback to queue`);
      delayed.push(par); // Сохраняем коллбэк в очередь ожидающих получения элемента из пула.
    }
  };
};

// Usage

// Factory to allocate 4kb buffer
const buffer = () => new Uint32Array(1024);

// Allocate pool of 10 buffers
const pool = poolify(buffer, 3, 5, 7);

let i = 0;

const next = () => {
  pool((item) => {
    i++;
    if (i < 20) {
      setTimeout(next, i * 10);
      setTimeout(pool, i * 100, item);
    }
  });
};

next();
