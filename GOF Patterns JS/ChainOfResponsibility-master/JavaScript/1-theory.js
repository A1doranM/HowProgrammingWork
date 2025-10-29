'use strict';

class AbstractHandler {
  constructor() {
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === AbstractHandler) {
      throw new Error('Abstract class should not be instanciated');
    }
    this.next = null;
  }

  method(value) {
    const s = JSON.stringify({ method1: { value } });
    throw new Error('Method is not implemented: ' + s);
  }
}

class NumberHandler extends AbstractHandler {
  method(value, next) {
    if (typeof value === 'number') {
      return value.toString();
    }
    return next();
  }
}

class ArrayHandler extends AbstractHandler {
  method(value, next) {
    if (Array.isArray(value)) {
      return value.reduce((a, b) => a + b);
    }
    return next();
  }
}

class Sender {
  constructor() {
    this.first = null;
    this.last = null;
  }

  add(handler) {
    if (!this.first) this.first = handler;
    else this.last.next = handler;
    this.last = handler;
    return this;
  }

  process(value) {
    let current = this.first;
    const step = () =>
      current.method(value, () => {
        current = current.next;
        if (current) return step();
        throw new Error('No handler detected');
      });
    return step().toString();
  }
}

// Usage

const sender = new Sender().add(new NumberHandler()).add(new ArrayHandler());

{
  const result = sender.process(100);
  console.dir({ result });
}

{
  const result = sender.process([1, 2, 3]);
  console.dir({ result });
}
