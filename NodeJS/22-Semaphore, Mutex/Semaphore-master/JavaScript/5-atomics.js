"use strict";

const fs = require("fs");
const threads = require("worker_threads");
const { Worker, isMainThread } = threads;

// Улучшим семафор при помощи Атомиков.

class CountingSemaphore {
  constructor(shared, offset = 0, initial) {
    this.counter = new Int32Array(shared, offset, 1);
    if (typeof initial === "number") {
      Atomics.store(this.counter, 0, initial); // Теперь мы не работаем с массивом напрямую.
    }
  }

  enter(callback) {
    Atomics.wait(this.counter, 0, 0); // Ждем пока значение по индексу 0 не станет равно 0. Если оно не 0 то wait сразу завершится.
    Atomics.sub(this.counter, 0, 1); // Вычитаем из счетчика 1.
    setTimeout(callback, 0); // Вызываем коллбек. Теперь нам не нужна очередь так как есть Atomics.wait, который полностью замораживает поток.
                             // Это проблема такого подходя так как в таком случае теряется асинхронность внутри потока, но при этом такой вариант очень стабилен.
                             // Но все равно не полностью. Так как между операциями  Atomics.wait и Atomics.sub можно влезть в середину.
                             // Это может произойти потому что  Atomics.wait уже закончился, а Atomics.sub еще не начался.
  }

  leave() {
    Atomics.add(this.counter, 0, 1); // Увеличиваем счетчик на 1.
    Atomics.notify(this.counter, 0, 1); // Уведомляем один тред который проснется, если уведомить больше то тогда проснутся все кого уведомим.
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

  semaphore.enter(() => {
    const data = `Data from ${threadId}`.repeat(REPEAT_COUNT);
    fs.writeFile(file, data, () => {
      fs.unlink(file, () => {
        semaphore.leave();
      });
    });
  });
}
