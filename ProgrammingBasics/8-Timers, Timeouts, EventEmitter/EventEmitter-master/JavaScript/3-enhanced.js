"use strict";

// Используем EventEmitter из библиотеки.
const events = require("events");

const emitter = () => {
  const ee = new events.EventEmitter();
  const emit = ee.emit; // Сохраняем оригинальную функцию еmit.
  ee.emit = (...args) => { // Подменяем метод еmit своей лямбдой.
    emit.apply(ee, args); // Вызываем оригинальную функции прикрепляя ее к созданному объекту "ee"
                          // таким образом сначала исполнится наша функция, а потом оригинальная.
    args.unshift("*"); // Заберем звездочку из аргументов.
    emit.apply(ee, args); // Опять вызвали emit.
  };
  return ee;
};

module.exports = emitter;
