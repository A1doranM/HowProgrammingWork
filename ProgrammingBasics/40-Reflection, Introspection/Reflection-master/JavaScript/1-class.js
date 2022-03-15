"use strict";

// С помощью рефлексии динамически создаем класс.

const build = (...fields) => class {
  constructor(...values) {
    for (let i = 0; i < fields.length; i++) {
      const key = fields[i];
      this[key] = values[i];
    }
  }
};

// Usage

const Class = build("x", "y", "z");

const instance = new Class(10, 20, 50);

console.log({ instance });
