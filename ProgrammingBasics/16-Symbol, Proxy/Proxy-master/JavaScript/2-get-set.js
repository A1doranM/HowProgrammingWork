"use strict";

// Просто пример с get, set без прокси.

const obj = {
  get x() {
    return 100;
  },
  set x(v) {
    console.log("set", v);
  }
};

obj.x = 5;
console.log(obj.x);
