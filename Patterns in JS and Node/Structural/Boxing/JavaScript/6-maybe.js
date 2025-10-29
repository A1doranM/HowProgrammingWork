'use strict';

class Maybe {
  #value;

  constructor(value) {
    this.#value = value;
  }

  get value() {
    return this.#value;
  }

  isEmpty() {
    return this.#value === undefined || this.#value === null;
  }

  match(someFn, noneFn) {
    return this.isEmpty() ? noneFn() : someFn(this.#value);
  }
}

// Usage

const some = new Maybe(42);
const none = new Maybe();

console.log(some);
console.log(none);

console.log(some.isEmpty());
console.log(none.isEmpty());

console.log(some.value);
console.log(none.value);

const res1 = some.match(
  (v) => `Got value ${v}`,
  () => 'No value',
);
console.log(res1);

const res2 = none.match(
  (v) => `Got value ${v}`,
  () => 'No value',
);
console.log(res2);
