"use strict";

const pow = (base, power) => {
  if (power === 1) return base;
  else return pow(base, power - 1) * base;
};

console.log(pow(2, 3));
