"use strict";

// Пример безопасного семафора со счетчиком.

const fs = require("fs");
const threads = require("worker_threads");
const { Worker, isMainThread } = threads;

class CountingSemaphore {
  constructor(shared, offset = 0, initial) {
    this.counter = new Int32Array(shared, offset, 1);
    if (typeof initial === "number") {
      Atomics.store(this.counter, 0, initial); // Атомарное хранилище.
    }
  }

  enter() {
    while (true) { // Крутим цикл.
      Atomics.wait(this.counter, 0, 0); // Ждем.
      const n = Atomics.load(this.counter, 0, 1); // Загрузили число из счетчика.
      if (n > 0) { // Если число больше 0 то тогда мы можем декрементировать число. Но если кто-то влез после  Atomics.wait
                   // и дерементировал число то мы опять пойдем в начало цикла и будем ждать.
        const prev = Atomics.compareExchange(this.counter, 0, n, n - 1); // Пробем заменить значение отнимая от n еденицу,
                                                                                             // Atomics.compareExchange позволит сделать это только если
                                                                                             // никто до этого не влез и не поменял n так как он сравнит
                                                                                             // n со счетчиком и только если они равны выполнит то что надо.
        if (prev === n) return; // Проверяем если предидущее состояние счетчика равно n то значит кто-то поменял prev до нас и мы опять идем в начало цикла ждать.
      }
    }
  }

  leave() {
    Atomics.add(this.counter, 0, 1); // Добавляем еденицу.
    Atomics.notify(this.counter, 0, 1); // Шлем уведомление одному треду.
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
  const REPEAT_COUNT = 1000000;
  const file = `file-${threadId}.dat`;
  console.dir({ threadId, semaphore: semaphore.counter[0] });

  semaphore.enter();
  const data = `Data from ${threadId}`.repeat(REPEAT_COUNT);
  fs.writeFile(file, data, () => {
    fs.unlink(file, () => {
      semaphore.leave();
    });
  });
}
