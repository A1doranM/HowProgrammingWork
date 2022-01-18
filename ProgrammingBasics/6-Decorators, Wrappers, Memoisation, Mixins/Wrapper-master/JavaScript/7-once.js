"use strict";

// Wrapper will prevent calls > n
// Создаем обертку которая ограничивает вызов функции одним вызовом.
const once = (f) => (...args) => {
  if (!f) return; // Если функции нету то ничего не делаем.
  const res = f(...args); // Забираем результат выполнения функции.
  f = null; // Обнуляем функцию которая хранится у нас в замыкании.
  return res; // Отдаем результат.
            // Теперь при следующем вызове мы выйдем сразу из блока if так как функция null
};

// Usage

const fn = (par) => {
  console.log("Function called, par:", par);
};

const fn2 = once(fn);

fn2("first");
fn2("second");
