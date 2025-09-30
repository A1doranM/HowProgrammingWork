"use strict";

// Facade that wraps Map and Node.js Timers to provide a simple interface for a
// collection with values that have expiration timeout.

// Фасад - паттерн сокрытия сложности. При этом фасад может внутри себя скрывать сразу несколько модулей.
// например фасад безопасности скрывает у себя все что относится к безопасности и работаем мы с ней только
// через него.
// Пример ниже использует коллекцию с таймаутом.

const TimeoutCollection = function(timeout) {
  this.timeout = timeout;
  this.collection = new Map();
  this.timers = new Map(); // Таймеры и таймаут будут скрыты за фасадом TimeCollection.
                           // таким образом ими управляет сама коллекция, и доступа снаружи мы к ним не имеем.
};

TimeoutCollection.prototype.set = function(key, value) {
  const timer = this.timers.get(key); // Забираем таймер из коллекции.
  if (timer) clearTimeout(timer); // Очищаем таймер если он есть в коллекции.
  const timeout = setTimeout(() => { // Устанавливаем таймаут.
    this.delete(key); // Удаляем элемент из коллекции когда будет превышен таймаут.
  }, this.timeout);
  timeout.unref(); // Отвязываем таймаут чтобы он не держал программу если мы захотим ее завершить.
  this.collection.set(key, value); // Сохраняем значение в коллекцию.
  this.timers.set(key, timeout); // Сохраняем таймаут.
};

TimeoutCollection.prototype.get = function(key) {
  return this.collection.get(key);
};

TimeoutCollection.prototype.delete = function(key) {
  const timer = this.timers.get(key);
  if (timer) {
    clearTimeout(timer);
    this.collection.delete(key);
    this.timers.delete(key);
  }
};

TimeoutCollection.prototype.toArray = function() {
  return [...this.collection.entries()];
};

// Usage

const hash = new TimeoutCollection(1000);
hash.set("uno", 1);
console.dir({ array: hash.toArray() });

hash.set("due", 2);
console.dir({ array: hash.toArray() });

setTimeout(() => {
  hash.set("tre", 3);
  console.dir({ array: hash.toArray() });

  setTimeout(() => {
    hash.set("quattro", 4);
    console.dir({ array: hash.toArray() });
  }, 500);

}, 1500);
