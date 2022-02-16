"use strict";

const fibonacci1 = (n) => {
  if (n <= 2) return 1;
  return fibonacci1(n - 1) + fibonacci1(n - 2);
};

console.log(fibonacci1(14));

const fibonacci2 = (n) => {
  let a = 1;
  let b = 0;
  let c = 0;
  while (n > 0) {
    c = a + b;
    b = a;
    a = c;
    n--;
  }
  return b;
};

console.log(fibonacci2(14));
