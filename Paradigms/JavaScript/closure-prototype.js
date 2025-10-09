'use strict';

function Point(ax, ay) {
  let x = ax;
  let y = ay;
  const move = (dx, dy) => {
    x += dx;
    y += dy;
  };
  const clone = () => new Point(x, y);
  const toString = () => `(${x}, ${y})`;
  return { move, clone, toString };
}

// Usage

const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
