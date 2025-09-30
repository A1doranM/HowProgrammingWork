"use strict";

// Очередь с максимальным инетрвалом ожидания и максимальным
// интервалом обработки.
// Все остальное почти так же.

class Queue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.count = 0;
    this.waiting = [];
    this.onProcess = null;
    this.onDone = null;
    this.onSuccess = null;
    this.onFailure = null;
    this.onDrain = null;
    this.waitTimeout = Infinity; // По умолчанию ждем бесконечно.
    this.processTimeout = Infinity;
  }

  static channels(concurrency) {
    return new Queue(concurrency);
  }

  wait(msec) {
    this.waitTimeout = msec;
    return this;
  }

  timeout(msec) {
    this.processTimeout = msec;
    return this;
  }

  add(task) {
    const hasChannel = this.count < this.concurrency;
    if (hasChannel) {
      this.next(task);
      return;
    }
    this.waiting.push({ task, start: Date.now() }); // Теперь добавляем еще поле когда элемент пришел.
  }

  next(task) {
    this.count++;
    let timer = null;
    let finished = false;
    const { processTimeout, onProcess } = this;
    const finish = (err, res) => { // Функция которая вызывается на таймере, или на коллбэке.
      if (finished) return; // Если флаг завершения задачи уже стоит значит сразу выходим.
      finished = true; // Иначе ставим влаг в true.
      if (timer) clearTimeout(timer); // Очищаем таймер на всякий случай.
      this.count--;
      this.finish(err, res); // Вызываем финиш, но не этот а у самого класса.
      if (this.waiting.length > 0) this.takeNext(); // Если кто-то еще ждет, вызываем следующую задачу.
    };
    if (processTimeout !== Infinity) { // Если таймаут задан
      timer = setTimeout(() => { // Дополнительно ставим таймаут
        timer = null; // При срабатываении обнуляем таймер
        const err = new Error("Process timed out");
        finish(err, task); // в финиш отдаем ошибку и задачу.
      }, processTimeout);
    }
    onProcess(task, finish); // Запускаем выполнение задачи.
  }

  takeNext() { // Берет следующую задачу.
    const { waiting, waitTimeout } = this; // Берем всех ожидающих и таймаут.
    const { task, start } = waiting.shift(); // Берем следующую задачу.
    if (waitTimeout !== Infinity) { // Если есть таймаут ожидания
      const delay = Date.now() - start; // смотрим не протухли ли они.
      if (delay > waitTimeout) { // Если протухли.
        const err = new Error("Waiting timed out");
        this.finish(err, task); // Завершаем с ошибкой.
        if (waiting.length > 0) this.takeNext(); // И если кто-то еще ждет то вызываем следующую задачу.
        return;
      }
    }
    this.next(task); // Если нету таймаута просто вызываем следующую задачу.
    return;
  }

  finish(err, res) { // Проверяет события и вызывает их.
    const { onFailure, onSuccess, onDone, onDrain } = this;
    if (err) {
      if (onFailure) onFailure(err, res);
    } else if (onSuccess) {
      onSuccess(res);
    }
    if (onDone) onDone(err, res);
    if (this.count === 0 && onDrain) onDrain();
  }

  process(listener) {
    this.onProcess = listener;
    return this;
  }

  done(listener) {
    this.onDone = listener;
    return this;
  }

  success(listener) {
    this.onSuccess = listener;
    return this;
  }

  failure(listener) {
    this.onFailure = listener;
    return this;
  }

  drain(listener) {
    this.onDrain = listener;
    return this;
  }
}

// Usage

const job = (task, next) => {
  setTimeout(next, task.interval, null, task);
};

const queue = Queue.channels(3)
  .wait(4000) // Сколько ожидать.
  .timeout(5000) // Сколько максимум выполнять.
  .process(job)
  .success(task => console.log(`Success: ${task.name}`))
  .failure((err, task) => console.log(`Failure: ${err} ${task.name}`))
  .drain(() => console.log("Queue drain"));

for (let i = 0; i < 10; i++) {
  queue.add({ name: `Task${i}`, interval: i * 1000 });
}
