"use strict";

// Надежная реализация для бинарного семафора.

const threads = require("worker_threads");
const { Worker, isMainThread } = threads;

const LOCKED = 0;
const UNLOCKED = 1;

class BinarySemaphore {
  constructor(shared, offset = 0, init = false) {
    this.lock = new Int32Array(shared, offset, 1);
    if (init) Atomics.store(this.lock, 0, UNLOCKED);
  }

  enter() {
    let prev = Atomics.exchange(this.lock, 0, LOCKED); // Он проще мы первой строчкой делаем Atomics.compareExchange и если он прошел,
                                                             // тоесть мы смогли переключить семафор.
    while (prev !== UNLOCKED) { // То можно не ждать, иначе ждем.
      Atomics.wait(this.lock, 0, LOCKED); // Ждем нотификацию.
      prev = Atomics.exchange(this.lock, 0, LOCKED); // Опять делаем Atomics.compareExchange дальше выполнится while.
                                                           // Проверит получилось, или кто-то влез. И либо пойдет дальше, либо будем ждать.
    }
  }

  leave() {
    if (Atomics.load(this.lock, 0) === UNLOCKED) {
      throw new Error("Cannot leave unlocked BinarySemaphore");
    }
    Atomics.store(this.lock, 0, UNLOCKED);
    Atomics.notify(this.lock, 0, 1);
  }
}

// Usage

if (isMainThread) {
  const buffer = new SharedArrayBuffer(14);
  const semaphore = new BinarySemaphore(buffer, 0, true);
  console.dir({ semaphore });
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const semaphore = new BinarySemaphore(workerData);
  const array = new Int8Array(workerData, 4);
  const value = threadId === 1 ? 1 : -1;

  setInterval(() => {
    semaphore.enter();
    for (let i = 0; i < 10; i++) {
      array[i] += value;
    }
    console.dir([ threadId, semaphore.lock[0], array ]);
    semaphore.leave();
  }, 100); // change to 10 to see race condition
}
