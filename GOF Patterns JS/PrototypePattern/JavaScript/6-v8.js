'use strict';

const { serialize, deserialize } = require('v8');

class Point {
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  move(x, y) {
    this.#x += x;
    this.#y += y;
  }

  clone() {
    return new Point(this.#x, this.#y);
  }

  toString() {
    return `(${this.#x}, ${this.#y})`;
  }
}

// Usage

const line = [new Point(0, 0), new Point(10, 10)];
console.log(line);
console.log(line.map((point) => point.toString()));
const data = serialize(line);
console.log(data);
const clone = deserialize(data);
for (const point of clone) {
  Object.setPrototypeOf(point, Point.prototype);
}
console.log(clone.map((point) => point.toString()));
