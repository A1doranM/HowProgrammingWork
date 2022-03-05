"use strict";

// Более продвинутый пример в котором мы даем промису возможность отменять
// его.

class Cancelable extends Promise {
  constructor(executor) { // Реализуем контракт промиса который в конструктор принимает функцию с двумя
                          // аргументами resolve, reject.
    super((resolve, reject) => { // Вызываем конструктор промиса.
      executor((val) => { // В экзекьюторе проверяем
        if (this.canceled) { // не отменина ли опирация.
          reject(new Error("Cancelled")); // Если отменили вызываем reject.
          return;
        }
        resolve(val); // Иначе resolve.
      }, reject);
    });
    this.canceled = false; // Флаг отмены.
  }

  cancel() { // Метод для отмены промисов.
    this.canceled = true;
  }
}

// Usage

{
  const promise = new Cancelable((resolve) => {
    setTimeout(() => {
      resolve("first");
    }, 10);
  });

  promise.then(console.log).catch(console.log);
  console.dir({ promise });
}

{
  const promise = new Cancelable((resolve) => {
    setTimeout(() => {
      resolve("second");
    }, 10);
  });

  promise.cancel();
  promise.then(console.log).catch(console.log);
  console.dir({ promise });
}
