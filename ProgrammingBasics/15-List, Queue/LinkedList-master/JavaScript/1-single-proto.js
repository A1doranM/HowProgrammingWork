"use strict";

// Лист хранит в себе ссылку на предыдущий элемент.
// Ниже пример простейшей реализации.

// При создании мы передаем
function Node(prev, data) {
  this.prev = prev; // ссылку на предыдущий элемент
  this.data = data; // и данные.
}

// Usage
const n1 = new Node(null, { name: "first" });
const n2 = new Node(n1, { name: "second" });
const n3 = new Node(n2, { name: "third" });

console.dir(n1);
console.dir(n2);
console.dir(n3);
