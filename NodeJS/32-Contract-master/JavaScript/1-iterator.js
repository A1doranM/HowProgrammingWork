"use strict";

const iterator = {
  next() {
    return {
      value: "value",
      done: false,
    };
  }
};

const item1 = iterator.next();
console.dir({ item1 });

const item2 = iterator.next();
console.dir({ item2 });

const item3 = iterator.next();
console.dir({ item3 });
