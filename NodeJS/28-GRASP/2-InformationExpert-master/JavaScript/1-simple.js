"use strict";

// Принцип информационного эксперта на примере двух связного списка.

class List {
  constructor() {
    this.first = null;
    this.last = null;
    this.length = 0;
  }

  push(data) {
    const node = { list: this, data, prev: null, next: null };
    node.prev = this.last;
    if (this.length === 0) this.first = node;
    else this.last.next = node;
    this.last = node;
    this.length++;
    return node;
  }

  pop() {
    if (this.length === 0) return null;
    const node = this.last;
    this.last = node.prev;
    node.list = null;
    node.prev = null;
    node.next = null;
    this.length--;
    return node.data;
  }
}

// Usage

const list = new List();
list.push({ name: "first" });
list.push({ name: "second" });
list.push({ name: "third" });

// Вот такая строчка и обращение нарушает принцип информационного эксперта.
list.last.prev.prev = list.last.prev;

console.dir(list.pop());
console.dir(list.pop());
console.dir(list.pop());
