'use strict';

class Proactor {
  #tasks = [];

  enqueue(fn, callback) {
    this.#tasks.push({ fn, callback });
  }

  start() {
    while (this.#tasks.length) {
      const tasks = this.#tasks.splice(0);
      this.#next(tasks, 0);
    }
  }

  #next(tasks, offset) {
    if (offset >= tasks.length) return;
    const handler = tasks[offset];
    handler.fn((err, data) => {
      handler.callback(err, data);
      this.#next(tasks, offset + 1);
    });
  }
}

// Usage

const eventLoop = new Proactor();

const fakeAsyncRead = (name, callback) => {
  const delay = Math.random() * 1000;
  const fn = (done) => {
    setTimeout(() => {
      done(null, 'FILE DATA');
    }, delay);
  };
  eventLoop.enqueue(fn, callback);
};

fakeAsyncRead('File A', (err, data) => {
  if (err) console.error(`[Proactor] File A: failed "${err.message}"`);
  else console.log(`[Proactor] File A: done "${data}"`);
});

fakeAsyncRead('File B', (err, data) => {
  if (err) console.error(`[Proactor] File B: failed "${err.message}"`);
  else console.log(`[Proactor] File B: done "${data}"`);
});

fakeAsyncRead('File C', (err, data) => {
  if (err) console.error(`[Proactor] File C: failed "${err.message}"`);
  else console.log(`[Proactor] File C: done "${data}"`);
});

eventLoop.start();
