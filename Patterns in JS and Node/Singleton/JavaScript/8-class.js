'use strict';

class Singleton {
  static #instance;

  constructor() {
    const instance = Singleton.#instance;
    if (instance) return instance;
    Singleton.#instance = this;
  }
}

// Usage

console.assert(new Singleton() === new Singleton());
console.log('instances are equal');
