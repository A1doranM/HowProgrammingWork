'use strict';

const timers = require('node:timers/promises');

class Proactor {
  #tasks = [];
  #active = false;

  enqueue(fn) {
    this.#tasks.push(fn);
  }

  async start() {
    this.#active = true;
    while (this.#active) {
      const tasks = this.#tasks.splice(0);
      for (const fn of tasks) await fn();
      await timers.setTimeout(100);
    }
  }

  stop() {
    this.#tasks.splice(0);
    this.#active = false;
  }
}

// Usage

const eventLoop = new Proactor();

const fs = require('node:fs/promises');

const readAsync = (name, encoding = 'utf8') => {
  const promise = new Promise((resolve, reject) => {
    eventLoop.enqueue(async () => {
      try {
        const data = await fs.readFile(name, encoding);
        console.log(`[Proactor] Read file: ${name}`);
        resolve(data);
      } catch (err) {
        console.error(`[Proactor] Failed to read file: ${name}`, err);
        reject(err);
      }
    });
  });
  return promise;
};

const main = async () => {
  eventLoop.start();
  const data = await readAsync('./4-await.js');
  console.log('File content:', data);
  eventLoop.stop();
};

main();
