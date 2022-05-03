"use strict";

// Очередь работает по принципу последний пришел и последний вышел LILA.
// Добавление происходит в начало и достаются элементы с начала.
// Она сделана на основе односвязного списка который хранит ссылку на следующий элемент,
// а не на предыдущий.

class Queue {
  constructor() {
    this.first = null;
    this.last = null;
  }

  put(item) { // Кладет элемент в начало.
    const last = this.last; // Берем последний элемент.
    const element = { next: null, item }; // Создаем новый элемент.
    if (last) { // Если последний добавленный был
      last.next = element; // добавляем ссылку на новый элемент
      this.last = element; // новый элемент становится последним.
    } else {
      this.first = element;
      this.last = element;
    }
  }

  pick() { // Достает с начала.
    const element = this.first; // Берем первый элемент
    if (!element) return null;
    if (this.last === element) { // Если первый равен последнему.
      this.first = null; // Обнуляем ссылки.
      this.last = null;
    } else {
      this.first = element.next; // Первый элемент становится равен следующему в очереди.
    }
    return element.item; // Возвращаем элемент который забрали.
  }
}

module.exports = Queue;

// Usage

const obj1 = { name: "first" };
const obj2 = { name: "second" };
const obj3 = { name: "third" };

const queue = new Queue();
queue.put(obj1);
queue.put(obj2);
queue.put(obj3);

console.dir(queue.pick());
console.dir(queue.pick());
console.dir(queue.pick());
console.dir(queue.pick());
