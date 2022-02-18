"use strict";

const obj1 = {
  value: 2,
  async* asyncGenMethod(a) {
    yield this.value;
    this.value *= a;
    return this.value;
  }
};

console.log("obj1 =", obj1);
console.log("obj1.asyncGenMethod(5) =", obj1.asyncGenMethod(5));
console.log("obj1.asyncGenMethod(5).next() =", obj1.asyncGenMethod(5).next());

// obj1.asyncGenMethod(5).next().then(console.log);
