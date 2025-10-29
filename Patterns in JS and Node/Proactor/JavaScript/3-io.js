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

const fs = require('node:fs');

const readFile = (path, encoding, callback) => {
  const fn = (done) => {
    fs.readFile(path, encoding, done);
  };
  eventLoop.enqueue(fn, callback);
};

readFile('./3-io.js', 'utf8', (err, data) => {
  if (err) console.error('Error:', err.message);
  else console.log('File contents:', data);
});

eventLoop.start();
