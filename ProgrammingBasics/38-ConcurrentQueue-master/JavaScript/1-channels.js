"use strict";

class Queue {
  constructor(concurrency) {
    this.concurrency = concurrency; // Количество каналов, или уровень конкурентности
    this.count = 0; // сколько сейчас обрабатывается
    this.waiting = []; // массив ожидающих исполнения
    this.onProcess = null; // обработчики.
    this.onDone = null;
    this.onSuccess = null;
    this.onFailure = null;
    this.onDrain = null;
  }

  static channels(concurrency) { // Фабрика очередей.
    return new Queue(concurrency);
  }

  add(task) { // Добавляем таску в очередь.
    const hasChannel = this.count < this.concurrency; // Проверяем есть ли свободный канал
    if (hasChannel) {
      this.next(task); // если есть то добавляем
      return;
    }
    this.waiting.push(task); // иначе ставим в очередь.
  }

  next(task) { // Начинает обработку таски.
    this.count++; // Увеличили счетчик текущих тасок.
    this.onProcess(task, (err, result) => { // Вызвали onProcess отдавая таск и коллбэк на выполнение.
      if (err) { // Если вернулась ошибка
        if (this.onFailure) this.onFailure(err); // и есть обработчик, то вызываем его.
      } else if (this.onSuccess) { // Если нет ошибки
        this.onSuccess(result); // вызываем обработчик успешного завершения задачи.
      }
      if (this.onDone) this.onDone(err, result); // Если есть обработчик на onDone то туда и ошибку и результат отдаем.
                                                 // Это небольшое дублирование но так можно подписываться например только на результат, или ошибку, или и то и то.
      this.count--;
      if (this.waiting.length > 0) { // Если кто-то ожидает
        const task = this.waiting.shift(); // берем его
        this.next(task); // опять вызываем next
        return; // и выходим.
      }
      if (this.count === 0 && this.onDrain) { // Если никто не ждал и нет тасок
        this.onDrain(); // начинаем ждать и вызывам onDrain.
      }
    });
  }

  process(listener) { // Устанавливает таску которую надо делать.
    this.onProcess = listener;
    return this;
  }

  // Установщики обработчиков.
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
  console.log(`Process: ${task.name}`);
  setTimeout(next, task.interval, null, task);
};

const queue = Queue.channels(3) // Создаем трехканальную очередь
  .process(job) // навешиваем процедуру которую будем выполнять
  .done((err, res) => { // обработчик на завершение задачи в одном из каналов
    const { count } = queue;
    const waiting = queue.waiting.length;
    console.log(`Done: ${res.name}, count:${count}, waiting: ${waiting}`);
  })
  .success(res => console.log(`Success: ${res.name}`))
  .failure(err => console.log(`Failure: ${err}`))
  .drain(() => console.log("Queue drain")); // обработчик когда очередь опустела.

for (let i = 0; i < 10; i++) {
  queue.add({ name: `Task${i}`, interval: i * 1000 });
}
