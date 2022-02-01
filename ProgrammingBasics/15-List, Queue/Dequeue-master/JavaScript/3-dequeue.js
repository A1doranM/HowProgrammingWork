"use strict";

// Очередь с двумя концами где добавлять и забирать можно с обоих концов.
// Она реализована на основе двух связного списка.
// В целом это реализация обычного JS Array, так как они являются здесь двух связными списками.

class Dequeue {
  constructor() {
    this.first = null;
    this.last = null;
  }

  push(item) { // Добавить в конец.
    const last = this.last;
    const element = { prev: last, next: null, item };
    if (last) {
      last.next = element;
      this.last = element;
    } else {
      this.first = element;
      this.last = element;
    }
  }

  pop() { // Забрать с конца.
    const element = this.last;
    if (!element) return null;
    if (this.first === element) {
      this.first = null;
      this.last = null;
    } else {
      this.last = element.prev;
      this.last.next = null;
    }
    return element.item;
  }

  unshift(item) { // Забрать с начала.
    const first = this.first;
    const element = { prev: null, next: first, item };
    if (first) {
      first.prev = element;
      this.first = element;
    } else {
      this.first = element;
      this.last = element;
    }
  }

  shift() { // Добавить в начало.
    const element = this.first;
    if (!element) return null;
    if (this.last === element) {
      this.first = null;
      this.last = null;
    } else {
      this.first = element.next;
      this.first.prev = null;
    }
    return element.item;
  }
}

// Usage

const obj1 = { name: "first" };
const obj2 = { name: "second" };
const obj3 = { name: "third" };

const list = new Dequeue();
list.push(obj1);
list.push(obj2);
list.unshift(obj3);

console.dir(list.pop());
console.dir(list.shift());
console.dir(list.shift());
