"use strict";

// Итерируемся по цепочке наследования на примере Cancellable промиса.

// Функция на вход принимает инстанс который надо развернуть в цепочку
// второй аргумент нужен для рекурсии там будет хранится цепочка наследования.
const inheritance = (instance, parents = []) => {
  const parent = Object.getPrototypeOf(instance); // Берем предка.
  parents.push(parent.constructor.name); // И добавляем имя его конструктора в массив.
  if (Object.getPrototypeOf(parent)) return inheritance(parent, parents); // И опять вызываем функцию пока есть родитель.
  return parents;
};

// Usage

class Cancelable extends Promise {
  constructor(executor) {
    super((resolve, reject) => {
      executor(val => {
        if (this.canceled) {
          reject(new Error("Cancelled"));
          return;
        }
        resolve(val);
      }, reject);
    });
    this.canceled = false;
  }

  cancel() {
    this.canceled = true;
  }
}

const promise = new Cancelable(resolve => {
  setTimeout(() => {
    resolve("first");
  }, 10);
});

console.log(inheritance(promise));
