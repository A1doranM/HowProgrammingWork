'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Value Object

class UserId {
  id;
  constructor(id) {
    this.id = id;
  }
}

// Null Object

class NullUser extends UserId {
  constructor() {
    super(-1);
  }
}

// Usage

const userId = new UserId(1012);
console.log(userId);
const userNone = new NullUser();
console.log(userNone);
