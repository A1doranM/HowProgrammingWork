"use strict";

// Более продвинутый пример на классах.

// Base classes
class Observable {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) { // Подписаться на изменения.
    observer.observable = this; // Записываем ссылку на самого себя и добавляем это в коллекцию, это необязательно
                                // но добавляет некоторое удобство использования.
    this.observers.push(observer);
    return this;
  }

  notify(data) { // Уведомить о изменениях.
    if (this.observers.length === 0) return; // Если никто не подписался.
    for (const observer of this.observers) { // Если есть подписчики по очереди вызываем у них метод update.
      observer.update(data);
    }
  }

  complete() { // Метод завершения работы генератора событий.
    throw new Error("Observable.complete is not implemented");
  }
}

// Тот кто будет наследоваться от наблюдателя должен будет переопределить метод update();
class Observer {
  update() {
    throw new Error("Observer.update is not implemented");
  }
}

// Usage

const randomChar = () => String
  .fromCharCode(Math.floor((Math.random() * 25) + 97));

class CharStream extends Observable { // Наследуемся от Observable для того чтобы генерировать события.
  constructor() {
    super();
    this.timer = setInterval(() => {
      const char = randomChar();
      this.notify(char); // Уведомляем всех подписчиков.
    }, 200);
  }

  complete() { // Переопределяем метод завершения работы.
    clearInterval(this.timer);
  }
}

class CharStreamObserver extends Observer { // Наследуемся от наблюдателя и переопределяем метод update.
  constructor() {
    super();
    this.count = 0; // Храним количество событий.
    this.observable = null; // Ссылка на генератор событий.
  }

  update(char) {
    process.stdout.write(char);
    this.count++; // Увеличиваем счетчик
    if (this.count > 50) { // и если он достиг 50 то прекращаем слушать события.
      this.observable.complete(); // Останавливаем генератор событий.
      process.stdout.write("\n");
    }
  }
}

const observer = new CharStreamObserver();
const observable = new CharStream().subscribe(observer);
console.dir({ observer, observable });
