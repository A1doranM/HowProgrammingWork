"use strict";

// Двух связный список на прототипах, принцип LIFO.

function LinkedList() {
  this.first = null; // Ссылка на первый элемент
  this.last = null; // на последний.
  this.length = 0;
}

LinkedList.prototype.push = function(data) {
  const node = new Node(this, data); // Создаем экземпляр Ноды.
  node.prev = this.last; // В prev записываем ссылку на последний элемент.
  if (this.length === 0) this.first = node; // Если не одного не было, то в ставим новый элемент первым,
  else this.last.next = node; // если есть элементы то предыдущему элементу ставим указатель на текущий элемент.
  this.last = node; // В ссылку на последний элемент записываем текущий.
  this.length++; // Увеличиваем длину.
  return node;
};

LinkedList.prototype.pop = function() { // Берет последний элемент и удаляет его из списка.
  if (this.length === 0) return null; // Если список пуст.
  const node = this.last; // Берем последний элемент.
  this.last = node.prev; // В последний элемент сохраняем элемент перед доставаемым.
  if (this.last) this.last.next = null; // Если удалили последний
  // У открепляемого элемента надо очистить ссылки поскольку если кто-то в программе их запросил у него
  // могут остаться ссылки на список, предыдущий и последующий элементы, а так быть не должно.
  node.list = null; // очищаем ссылки на текущий список
  node.prev = null; // предыдущий элемент
  node.next = null; // следующий элемент.
  this.length--; // Уменьшаем количество элементов.
  return node.data; // Возвращаем данные с текущего элемента.
};

// Структура описывающая элемент.
function Node(list, data) {
  this.list = list; // Ссылка на список в котором он лежит
  this.data = data; // данные
  this.prev = null; // предыдущий элемент
  this.next = null; // следующий элемент.
}

// Usage

const list = new LinkedList();
list.push({ name: "first" });
list.push({ name: "second" });
list.push({ name: "third" });

console.dir(list.pop());
console.dir(list.pop());
console.dir(list.pop());
console.dir(list.pop());

list.push({ name: "uno" });
list.push({ name: "due" });
console.dir(list.pop());
list.push({ name: "tre" });
console.dir(list.pop());
console.dir(list.pop());
