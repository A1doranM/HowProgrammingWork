'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Value Object

class UserName {
  value;
  constructor(value) {
    this.value = value;
    if (typeof value !== 'string') {
      throw new Error('Name expected to be string');
    }
    if (value.length < 2) {
      throw new Error('Name is too short');
    }
    if (value.indexOf(' ') === -1) {
      throw new Error('Name is too simple');
    }
  }
}

// Usage

try {
  const name1 = new UserName('Marcus Aurelius');
  console.log({ name1 });
} catch (error) {
  console.error(error);
}

try {
  const name2 = new UserName('Marcus');
} catch (error) {
  console.error(error);
}

try {
  const name3 = new UserName('M');
} catch (error) {
  console.error(error);
}
