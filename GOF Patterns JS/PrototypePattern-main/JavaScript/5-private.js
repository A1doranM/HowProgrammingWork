'use strict';

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
console.log(line.map((point) => point.toString()));
const clone = structuredClone(line);
for (const point of clone) {
  Object.setPrototypeOf(point, Point.prototype);
}
console.log(clone.map((point) => point.toString()));
