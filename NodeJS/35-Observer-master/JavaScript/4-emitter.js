"use strict";

// Используем встроенный EventEmitter.

const { EventEmitter } = require("events");

// Usage

const randomChar = () => String
  .fromCharCode(Math.floor((Math.random() * 25) + 97));

class CharStream { // Observable
  constructor(ee) { // В конструктор принимаем EventEmitter.
    this.timer = setInterval(() => {
      const char = randomChar();
      ee.emit("char", char); // Генерируем события.
    }, 200);
  }

  complete() {
    clearInterval(this.timer);
  }
}

const ee = new EventEmitter();
const observable = new CharStream(ee);

let count = 0;

const observer = char => {
  process.stdout.write(char);
  count++;
  if (count > 50) {
    observable.complete();
    process.stdout.write("\n");
  }
};

ee.on("char", observer); // Подписываемся на события.

console.dir({ observer, observable });
