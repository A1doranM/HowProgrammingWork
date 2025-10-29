'use strict';

class Handler {
  constructor(fn) {
    this.fn = fn;
    this.next = null;
  }
}

class Sender {
  constructor() {
    this.first = null;
    this.last = null;
  }

  add(fn) {
    const handler = new Handler(fn);
    if (!this.first) this.first = handler;
    else this.last.next = handler;
    this.last = handler;
    return this;
  }

  process(value) {
    let current = this.first;
    const step = () =>
      current.fn(value, () => {
        current = current.next;
        if (current) return step();
        throw new Error('No handler detected');
      });
    return step().toString();
  }
}

// Usage

const sender = new Sender()
  .add((value, next) => {
    if (typeof value === 'number') {
      return value.toString();
    }
    return next();
  })
  .add((value, next) => {
    if (Array.isArray(value)) {
      return value.reduce((a, b) => a + b);
    }
    return next();
  });

{
  const result = sender.process(100);
  console.dir({ result });
}

{
  const result = sender.process([1, 2, 3]);
  console.dir({ result });
}
