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

const fakeAsyncRead = (name) => () => {
  const timeout = Math.random() * 1000;
  setTimeout(() => {
    console.log(`[Reactor] ${name} done`);
  }, timeout);
};

eventLoop.enqueue(fakeAsyncRead('File A'));
eventLoop.enqueue(fakeAsyncRead('File B'));
eventLoop.enqueue(fakeAsyncRead('File C'));

eventLoop.start();
