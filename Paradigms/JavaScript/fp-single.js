'use strict';

const createPoint = (x) => (y) => ({ map: (f) => f(x)(y) });
const move = (dx) => (dy) => (x) => (y) => createPoint(x + dx)(y + dy);
const clone = createPoint;
const toString = (x) => (y) => `(${x}, ${y})`;

// Usage

const p1 = createPoint(10)(20);
console.log(p1.map(toString));
const c0 = p1.map(clone);
console.log(c0.map(toString));
const c1 = p1.map(move(-5)(10));
console.log(c1.map(toString));
