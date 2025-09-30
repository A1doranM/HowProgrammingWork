"use strict";

// Адаптер - паттерн достижения совместимости. С помощью этого паттерна несколько несовместимых интерфейсов
// можно обернуть в адаптер и дать совместимый для работы с ними интерфейс.
// Тоесть любой класс имеющий подходящий функционал, но не подходящий контракт можно обернуть в адаптер.

// Пример. У нас есть массив, но по контракту у него должны быть только методы получить элемент
// добавить в очередь и удалить из нее.
// Пример на прототипах.
const ArrayToQueueAdapter = function() {
  Array.call(this); // Вызываем конструктор Array передавая ему this, таким образом мы наследуемся от него.
};

ArrayToQueueAdapter.prototype.enqueue = function(data) { // Оборачиваем методы push и
  this.push(data);
};

ArrayToQueueAdapter.prototype.dequeue = function() { // pop переименовывая их в enqueue и dequeue
  return this.pop();
};

Object.defineProperty(ArrayToQueueAdapter.prototype, "count", { // Устанавливаем свойство count.
  get: function myProperty() {
    return this.length;
  }
});

Object.setPrototypeOf(ArrayToQueueAdapter.prototype, Array.prototype); // Устанавливаем прототип для нашей очереди.

// Usage

const queue = new ArrayToQueueAdapter();
queue.enqueue("uno");
queue.enqueue("due");
queue.enqueue("tre");
while (queue.count) {
  console.log(queue.dequeue());
}
