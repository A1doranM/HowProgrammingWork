"use strict";

// А теперь с CQS.
class Adder {
  constructor(x) {
    this.value = x;
  }

  getValue() {
    return this.value;
  }

  add(x) {
    this.value += x;
  }
}

const a1 = new Adder(2);

console.log(a1.add(7));
console.log(a1.getValue());
console.log(a1.add(3));
console.log(a1.getValue());
console.log(a1.add(8));
console.log(a1.getValue());
