"use strict";

// Продвинутый пример через замыкания.

const Singleton = new (function () {
  // Функция конструктор которая в замыкании
  const single = this; // сохраняет this
  return function () {
    return single;
  }; // и возвращает функцию которая возвращает single.
})(); // Из функционального выражения приходит конструктор, который мы создаем
// через new и после вызова сохраняем в Singleton.

// Usage

console.assert(new Singleton() === new Singleton());
console.log("instances are equal");
