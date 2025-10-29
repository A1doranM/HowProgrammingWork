'use strict';

const point = (x, y) => {
  const move = (dx, dy) => {
    x += dx;
    y += dy;
  };
  const clone = () => point(x, y);
  const toString = () => `(${x}, ${y})`;
  return { move, clone, toString };
};

// Usage

const p1 = point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
