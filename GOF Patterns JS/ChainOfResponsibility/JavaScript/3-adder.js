'use strict';

class Adder {
  constructor(type, reducer) {
    this.type = type;
    this.reducer = reducer;
    this.next = null;
  }
}

class Chain {
  constructor() {
    this.first = null;
    this.last = null;
  }

  add(adder) {
    if (!this.first) this.first = adder;
    else this.last.next = adder;
    this.last = adder;
    return this;
  }

  process(collection) {
    let adder = this.first;
    do {
      if (collection instanceof adder.type) {
        return adder.reducer(collection);
      }
      adder = adder.next;
    } while (adder);
    throw new Error('Unsupported collection type');
  }
}

// Usage

const sum = (a, b) => a + b;

const chain = new Chain()
  .add(new Adder(Array, (array) => array.reduce(sum)))
  .add(new Adder(Set, (set) => [...set].reduce(sum)))
  .add(new Adder(Uint8Array, (u8a) => Array.from(u8a).reduce(sum)))
  .add(new Adder(Object, (obj) => `Not supported ${obj.constructor.name}`));

const sum1 = chain.process([1, 2, 3]);
console.dir({ sum1 });

const sum2 = chain.process(new Set([1, 2, 3]));
console.dir({ sum2 });

const sum3 = chain.process(new Uint8Array([1, 2, 3]));
console.dir({ sum3 });

const sum4 = chain.process(new Int32Array([1, 2, 3]));
console.dir({ sum4 });
