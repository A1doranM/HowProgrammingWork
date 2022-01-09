"use strict";

const fs = require("fs");
const threads = require("worker_threads");
const { Worker, isMainThread } = threads;

// Добавляем взоход в критическую секцию через коллбек.

class CountingSemaphore {
  constructor(shared, offset = 0, initial) {
    this.counter = new Int32Array(shared, offset, 1);
    if (typeof initial === "number") {
      this.counter[0] = initial;
    }
    this.queue = []; // Очередь коллбеков.
  }

  enter(callback) {
    if (this.counter[0] > 0) { // Если счетчик больше 0
      this.counter[0]--; // декрементируем
      setTimeout(callback, 0); // выполняем асинхронно коллбэк.
    } else {
      this.queue.push(callback); // Иначе кладем его в очередь.
    }
  }

  leave() {
    this.counter[0]++; // Увеличиваем счетчик.
    if (this.queue.length > 0) { // Если кто-то в очереди
      const callback = this.queue.shift(); // забираем первого кто в нее вошел.
      this.counter[0]--; // уменьшаем счетчик
      setTimeout(callback, 0); // вызываем коллбэк.
    }
  }
}

// Usage

if (isMainThread) {
  const buffer = new SharedArrayBuffer(4);
  // Try to change 10 to 2 at next lene to check solution
  const semaphore = new CountingSemaphore(buffer, 0, 10);
  console.dir({ semaphore: semaphore.counter[0] });
  for (let i = 0; i < 20; i++) {
    new Worker(__filename, { workerData: buffer });
  }
} else {
  const { threadId, workerData } = threads;
  const semaphore = new CountingSemaphore(workerData);
  console.dir({ threadId, semaphore: semaphore.counter[0] });
  const REPEAT_COUNT = 1000000;
  const file = `file-${threadId}.dat`;

  semaphore.enter(() => { // Входим в критическую секцию.
    const data = `Data from ${threadId}`.repeat(REPEAT_COUNT);
    fs.writeFile(file, data, () => {
      fs.unlink(file, () => {
        semaphore.leave();
      });
    });
  });
}
