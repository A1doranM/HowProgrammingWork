"use strict";

// Мьютекс в отличии от семафора имеет поле owner и
// только тот поток который заблочил мьютекс может его разблочить.

const threads = require("worker_threads");
const { Worker, isMainThread } = threads;

const LOCKED = 0;
const UNLOCKED = 1;

class Mutex {
  constructor(shared, offset = 0, initial = false) {
    this.lock = new Int32Array(shared, offset, 1);
    if (initial) Atomics.store(this.lock, 0, UNLOCKED);
    this.owner = false; // Когда создаем мьютекс по умолчанию у него нет владельца.
  }

  enter(callback) {
    Atomics.wait(this.lock, 0, LOCKED);
    Atomics.store(this.lock, 0, LOCKED);
    this.owner = true; // Когда кто-то устанавливает мьютекс помечаем наличие владельца.
    setTimeout(callback, 0); // Выполняем коллбек.
  }

  leave() {
    if (!this.owner) return; // Проверяем если мьютекс вытается разблочить не владелец.
    Atomics.store(this.lock, 0, UNLOCKED);
    Atomics.notify(this.lock, 0, 1);
    this.owner = false; // Удаляем владельца.
    return true; // Результат разблокировки.
  }
}

// Usage

if (isMainThread) {
  const buffer = new SharedArrayBuffer(4);
  const mutex = new Mutex(buffer, 0, true);
  console.dir({ mutex });
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const mutex = new Mutex(workerData);
  if (threadId === 1) { // Если первый тред
    mutex.enter(() => { // заходим в мьютекс.
      console.log("Entered mutex");
      setTimeout(() => {
        if (mutex.leave()) {
          console.log("Left mutex");
        }
      }, 100);
    });
  } else if (!mutex.leave()) {
    console.log("Can not leave mutex: not owner");
  }
}
