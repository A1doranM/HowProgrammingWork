"use strict";

// Enum factory

const Enum = (...values) => class {
  constructor(arg) {
    if (typeof arg === "number") {
      this.value = (arg > 0 && arg <= values.length) ? arg : undefined;
      return;
    }
    const value = values.indexOf(arg);
    this.value = value > 0 ? value + 1 : undefined;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.value;
    return values[this.value - 1];
  }
};

// Example type

const Month = Enum(
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
);

// Usage

const neg = new Month(-1);
const zero = new Month(0);
const first = new Month(1);
const april = new Month(4);
const may = new Month("May");
const last = new Month(12);
const next = new Month(13);
const unknown = new Month("Hello");

console.log([
  [-1, neg],
  [0, zero],
  [1, first],
  [4, april],
  ["May", may],
  [12, last],
  [13, next],
  ["Hello", unknown]
]);
