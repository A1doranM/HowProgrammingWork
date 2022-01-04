"use strict";

const adder = (value) => (x) => value += x;

const a1 = adder(2);

console.log(a1(7));
console.log(a1(3));
console.log(a1(8));
