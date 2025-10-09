'use strict';

const createPoint = (point, x, y) => {
  point.x = x;
  point.y = y;
};

const clone = (src, dest) => {
  dest.x = src.x;
  dest.y = src.y;
};

const move = (point, dx, dy) => {
  point.x += dx;
  point.y += dy;
};

const toString = (point, buffer) => {
  buffer.value = `(${point.x}, ${point.y})`;
};

// Usage

const p1 = {};
createPoint(p1, 10, 20);
const result = {};
toString(p1, result);
console.log(result.value);
const c1 = {};
clone(p1, c1);
move(c1, -5, 10);
toString(c1, result);
console.log(result.value);
