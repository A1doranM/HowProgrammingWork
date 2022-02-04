"use strict";

// Улучшенная версия где мы контролируем кол-во элементов. Пул не может стать больше чем максимальное кол-во.
             // фабрика, минимальное, нормальное, максимальное кол-во элементов.
const poolify = (factory, min, norm, max) => {
  const duplicate = (n) => new Array(n).fill().map(() => factory());
  const items = duplicate(norm); // Создаем нормальное количество элементов.

  return (item) => {
    if (item) {
      if (items.length < max) { // Пока меньше максимума
        items.push(item); // помещаем в пул.
      }
      console.log("Recycle item, count =", items.length);
      return; // Иначе ничего не делаем.
    }
    if (items.length < min) { // Если меньше минимума,
      const instances = duplicate(norm - items.length); // создаем столько чтобы дойти до нормального значения.
      items.push(...instances);
    }
    const res = items.pop();
    console.log("Get from pool, count =", items.length);
    return res;
  };
};

// Usage

// Factory to allocate 4kb buffer
const buffer = () => new Uint32Array(1024);

// Allocate pool of 10 buffers
const pool = poolify(buffer, 5, 10, 15);

let i = 0;

const next = () => {
  const item = pool();
  console.log("Buffer size", item.length * 32);
  i++;
  if (i < 20) {
    setTimeout(next, i * 10);
    setTimeout(() => pool(item), i * 100);
  }
};

next();
