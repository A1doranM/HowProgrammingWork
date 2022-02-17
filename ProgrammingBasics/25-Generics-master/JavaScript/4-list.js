"use strict";

class ListItem {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class List {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  push(data) {
    const item = new ListItem(data);
    if (this.head === null) {
      this.head = item;
    } else {
      item.prev = this.tail;
      this.tail.next = item;
    }
    this.tail = item;
  }

  display() {
    let current = this.head;
    while (current) {
      console.log(current.data);
      current = current.next;
    }
  }
}

// Usage

const list = new List();
list.push("Ave");
list.push("Emperor");
list.push("Marcus Aurelius!");
list.display();
