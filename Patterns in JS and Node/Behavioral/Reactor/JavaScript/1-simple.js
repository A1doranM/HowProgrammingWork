'use strict';

class Reactor {
  #tasks = [];

  enqueue(fn) {
    this.#tasks.push(fn);
  }

  start() {
    while (this.#tasks.length) {
      const tasks = this.#tasks.splice(0);
      for (const fn of tasks) fn();
    }
  }
}

// Usage

const eventLoop = new Reactor();

const setTimeout = (fn, delay) => {
  const start = Date.now();
  const check = () => {
    if (Date.now() - start >= delay) fn();
    else eventLoop.enqueue(check);
  };
  eventLoop.enqueue(check);
};

setTimeout(() => {
  console.log('Executed after ~1000ms (simulated)');
}, 1000);

setTimeout(() => {
  console.log('Executed after ~2000ms (simulated)');
}, 2000);

setTimeout(() => {
  console.log('Executed after ~3000ms (simulated)');
}, 3000);

eventLoop.start();
