"use strict";

const iterable = {
  [Symbol.iterator]() {
    return {
      next() {
        return {
          value: "value",
          done: false,
        };
      }
    };
  }
};

const iterator = iterable[Symbol.iterator]();

const item1 = iterator.next();
console.dir({ item1 });

const item2 = iterator.next();
console.dir({ item2 });

const item3 = iterator.next();
console.dir({ item3 });
