"use strict";

// Бинарный семафор. Но не совсем рабочий.

const threads = require("worker_threads");
const { Worker, isMainThread } = threads;

// Константы обозначающие заблокирован ресурс, или нет.
const LOCKED = 0;
const UNLOCKED = 1;

// Класс семафора. В конструктор передаем буфер, смещение в буфере, и чем семафор инициализировать.
class BinarySemaphore {
  constructor(shared, offset = 0, init = false) {
    this.lock = new Int8Array(shared, offset, 1); // В свойство лок добавляем массив из одного байта
    if (init) this.lock[0] = UNLOCKED; // к которому мы вот таким образом обращаемся.
  }

  enter() { // При сходе в критическую секцию.
    while (this.lock[0] !== UNLOCKED); // Ждем пока ресурс не разблокируется,
    this.lock[0] = LOCKED; // и после этого сразу его блокируем. Но это тоже не оптимальный вариант так как межу циклом и инструкцией
                           // может кто-то влезть.
  }

  leave() {
    if (this.lock[0] === UNLOCKED) { // Освобожден ли семафор.
      throw new Error("Cannot leave unlocked BinarySemaphore");
    }
    this.lock[0] = UNLOCKED; // Освобождаем семафор. При этом таким образом мы можем освободить семафор который заблочил другой тред.
  }
}

// Usage

if (isMainThread) {
  const buffer = new SharedArrayBuffer(11);
  const semaphore = new BinarySemaphore(buffer, 0, true);
  console.dir({ semaphore });
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const semaphore = new BinarySemaphore(workerData);
  const array = new Int8Array(workerData, 1);
  const value = threadId === 1 ? 1 : -1;
  setInterval(() => {
    semaphore.enter();
    for (let i = 0; i < 10; i++) {
      array[i] += value;
    }
    console.dir([ threadId, array ]);
    semaphore.leave();
  }, 100); // change to 10 to see race condition
}
