'use strict';

const createPoint = (x, y) => Object.freeze({ x, y });
const move = ({ x, y }, dx, dy) => createPoint(x + dx, y + dy);
const clone = (point) => createPoint(point.x, point.y);
const toString = (point) => `(${point.x}, ${point.y})`;

// Usage

const p1 = createPoint(10, 20);
console.log(toString(p1));
const c0 = clone(p1);
console.log(toString(c0));
const c1 = move(p1, -5, 10);
console.log(toString(c1));
