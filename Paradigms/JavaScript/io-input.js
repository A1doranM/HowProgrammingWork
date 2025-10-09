'use strict';

class IO {
  #effect;

  constructor(effect) {
    this.#effect = effect;
  }

  static of(effect) {
    return new IO(effect);
  }

  map(fn) {
    return new IO(() => fn(this.#effect()));
  }

  chain(fn) {
    return new IO(() => fn(this.#effect()).run());
  }

  run() {
    return this.#effect();
  }
}

class Point {
  #x;
  #y;

  constructor({ x, y }) {
    this.#x = x;
    this.#y = y;
  }

  static of({ x, y }) {
    return new Point({ x, y });
  }

  map(fn) {
    const { x, y } = fn({ x: this.#x, y: this.#y });
    return Point.of({ x, y });
  }

  chain(fn) {
    return fn({ x: this.#x, y: this.#y });
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

const move = (d) => ({ x, y }) => ({ x: x + d.x, y: y + d.y });
const clone = ({ x, y }) => ({ x, y });
const toString = ({ x, y }) => IO.of(() => `(${x}, ${y})`);

// Usage

const input = IO.of(() => Point.of({ x: 10, y: 20 }));

input.chain((point) => point.chain(toString))
  .map(console.log)
  .run();

const c0 = input.map((point) => point.map(clone));
const t1 = new PointTransform(move({ x: -5, y: 10 }));
const c1 = c0.map((point) => t1.ap(point));

c1.chain((point) => point.chain(toString))
  .map(console.log)
  .run();
