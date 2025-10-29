'use strict';

class Either {
  #left = null;
  #right = null;

  constructor({ left = null, right = null }) {
    this.#left = left;
    this.#right = right;
  }

  static left(value) {
    return new Either({ left: value, right: null });
  }

  static right(value) {
    return new Either({ left: null, right: value });
  }

  get left() {
    return this.#left;
  }

  get right() {
    return this.#right;
  }

  isLeft() {
    return this.#left !== null;
  }

  isRight() {
    return this.#right !== null;
  }

  map(fn) {
    if (this.#right === null) return this;
    return Either.right(fn(this.#right));
  }

  match(leftFn, rightFn) {
    const isRight = this.#right !== null;
    return isRight ? rightFn(this.#right) : leftFn(this.#left);
  }
}

// Usage

const success = Either.right(42);
const failure = Either.left(500);

const doubled = success.map((x) => x * 2);
console.log({ doubled: doubled.right });

const result = failure.match(
  (error) => `Failure: ${error}`,
  (value) => `Success: ${value}`,
);

console.log({ result });
