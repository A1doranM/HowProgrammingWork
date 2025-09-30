"use strict";

// Пул - это функция
const pool = item => {
  pool.items = pool.items || new Array(10).fill(new Array(1000).fill(0)); // Если пул уже создавался то не создаем новый пул.
                                                                                                    // Иначе создаем пул на из 10 массивов с 1000 элементов.

  if (item) {
    pool.items.push(item);
    console.log("Recycle item, count =", pool.items.length);
    return;
  }
  const res = pool.items.pop() || new Array(1000).fill(0); // Если пул пустой то мы создаем новый массив заполненный нулями.
                                                                          // то есть в начале отдаем все что есть, если кончилось создаем новые элементы.

  console.log("Get from pool, count =", pool.items.length);
  return res;
};

// Usage

const a1 = pool(); // Берем элемент из пула.
const b1 = a1.map((x, i) => i).reduce((x, y) => x + y);
console.log(b1);

const a2 = pool();
const b2 = a2.map((x, i) => i).reduce((x, y) => x + y);
console.log(b2);

pool(a1); // Возвращаем элемент в пул.
pool(a2);

const a3 = pool();
const b3 = a3.map((x, i) => i).reduce((x, y) => x + y);
console.log(b3);

// See: https://github.com/HowProgrammingWorks/Pool
