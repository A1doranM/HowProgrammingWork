'use strict';

const pipe = (...fns) => (obj) => fns.reduce((val, f) => f(val), obj);

// Implementation

const createPoint = (x) => (y) => ({ map: (f) => f({ x, y }) });
const move = (dx) => (dy) => ({ x, y }) => createPoint(x + dx)(y + dy);
const clone = ({ x, y }) => createPoint(x)(y);
const toString = ({ x, y }) => `(${x}, ${y})`;

// Usage

const p1 = createPoint(10)(20);
console.log(p1.map(toString));
const operations = pipe(clone, move(-5)(10), toString);
p1.map(operations);
