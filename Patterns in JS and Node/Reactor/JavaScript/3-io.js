'use strict';

class Reactor {
  #tasks = [];
  #active = false;

  enqueue(fn) {
    this.#tasks.push(fn);
  }

  start() {
    this.#active = true;
    while (this.#active && this.#tasks.length) {
      const tasks = this.#tasks.splice(0);
      for (const fn of tasks) fn();
    }
  }

  stop() {
    this.#tasks.splice(0);
    this.#active = false;
  }

  get active() {
    return this.#active;
  }
}

const eventLoop = new Reactor();

// File system

const { readFileSync } = require('node:fs');

const readFile = (path, encoding, callback) => {
  const read = () => {
    try {
      const data = readFileSync(path, encoding);
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  };
  eventLoop.enqueue(read);
};

// Usage

readFile('./3-io.js', 'utf8', (err, data) => {
  if (err) console.error('Error:', err.message);
  else console.log('File contents:', data);
});

readFile('./unknown.txt', 'utf8', (err, data) => {
  if (err) console.error('Error:', err.message);
  else console.log('File contents:', data);
});

eventLoop.start();
