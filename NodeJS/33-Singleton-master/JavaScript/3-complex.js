"use strict";

// Пример с классами.

const Singleton = (() => { // Создаем замыкание.
  let instance; // Создаем инстанс.

  class Singleton { // Создаем класс синглтон который вернется из функции.
    constructor() {
      if (instance) return instance; // Если инстанс уже существует возвращаем его
      instance = this; // иначе присваиваем this.
    }
  }

  return Singleton;
})();

// Usage

console.assert(new Singleton() === new Singleton());
console.log("instances are equal");
