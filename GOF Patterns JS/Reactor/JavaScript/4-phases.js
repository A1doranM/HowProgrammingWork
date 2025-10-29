'use strict';

class Reactor {
  #phases = {
    timers: [],
    io: [],
    check: [],
    close: [],
  };

  #queueCount = 0;
  #active = false;

  enqueue(phase, fn) {
    if (this.#phases[phase]) {
      this.#phases[phase].push(fn);
      this.#queueCount++;
    }
  }

  start() {
    this.#active = true;
    const phases = Object.keys(this.#phases);
    while (this.#active && this.#hasPending()) {
      for (const phase of phases) {
        const queue = this.#phases[phase].splice(0);
        this.#queueCount -= queue.length;
        for (const fn of queue) fn();
      }
    }
  }

  stop() {
    const phases = Object.values(this.#phases);
    for (const phase of phases) phase.splice(0);
    this.#queueCount = 0;
    this.#active = false;
  }

  get active() {
    return this.#active;
  }

  #hasPending() {
    return this.#queueCount > 0;
  }
}

const eventLoop = new Reactor();

// Timers

const timers = { id: 0 };
const timeouts = new Set();

const setTimeout = (fn, delay) => {
  const id = ++timers.id;
  const start = Date.now();

  const check = () => {
    if (!timeouts.has(id)) return;
    if (Date.now() - start >= delay) {
      timeouts.delete(id);
      fn();
    } else {
      eventLoop.enqueue('timers', check);
    }
  };

  timeouts.add(id);
  eventLoop.enqueue('timers', check);
  return id;
};

// File system

const { readFileSync } = require('node:fs');

const readFile = (path, encoding, callback) => {
  const read = () => {
    setTimeout(() => {
      try {
        const data = readFileSync(path, encoding);
        callback(null, data);
      } catch (err) {
        callback(err);
      }
    }, 1000);
  };
  eventLoop.enqueue('io', read);
};

// Usage

readFile('./4-phases.js', 'utf8', (err, data) => {
  if (err) console.error('Error:', err.message);
  else console.log('File contents:', data);
});

eventLoop.start();
