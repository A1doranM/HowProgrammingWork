"use strict";

// Пример с функцией. Такой подход в целом хуже, и дан больше для общего понимания.

const cancelable = (promise) => { // Принимаем на вход промис.
  let cancelled = false; // Флаг отмены.
  const next = promise.then((val) => { // Подписываемся на promise.then. Тоесть здесь создастся еще один промис.
    if (cancelled) return Promise.reject(new Error("Canceled")); // Отдаем reject.
    return val;
  });
  next.cancel = () => { // Примешиваем промису метод cancel.
    cancelled = true;
  };
  return next;
};

// Usage

{
  const promise = cancelable(new Promise((resolve) => {
    setTimeout(() => {
      resolve("first");
    }, 10);
  }));

  promise.then(console.log).catch(console.log);
  console.dir({ promise });
}

{
  const promise = cancelable(new Promise((resolve) => {
    setTimeout(() => {
      resolve("second");
    }, 10);
  }));

  promise.cancel();
  promise.then(console.log).catch(console.log);
  console.dir({ promise });
}
