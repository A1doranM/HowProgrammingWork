'use strict';

class Point {
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  static of(x, y) {
    return new Point(x, y);
  }

  map(fn) {
    const { x, y } = fn(this.#x, this.#y);
    return Point.of(x, y);
  }

  chain(fn) {
    return fn(this.#x, this.#y);
  }
}

class PointTransform {
  constructor(fn) {
    this.fn = fn;
  }

  ap(point) {
    return point.map(this.fn);
  }
}

class Serialized {
  #data;

  constructor(data) {
    this.#data = data;
  }

  map(fn) {
    fn(this.#data);
    return this;
  }
}

const move = (dx, dy) => (x, y) => ({ x: x + dx, y: y + dy });
const clone = (x, y) => ({ x, y });
const toString = (x, y) => new Serialized(`(${x}, ${y})`);

// Usage

const p1 = Point.of(10, 20);
p1.chain(toString).map(console.log);
const c0 = p1.map(clone);
const t1 = new PointTransform(move(-5, 10));
const c1 = t1.ap(c0);
c1.chain(toString).map(console.log);
