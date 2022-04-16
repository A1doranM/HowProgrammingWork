"use strict";

// Еще немного улучшаем наблюдаемый объект давая ему возможность фильтровать и мапить информацию.

class Observable {
  constructor() {
    this.observers = [];
    this.operators = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
    return this;
  }

  notify(data) {
    if (this.observers.length === 0) return;
    for (const operator of this.operators) { // Применяем операторы.
      if (operator.name === "filter") {
        if (!operator.fn(data)) return;
      }
      if (operator.name === "map") {
        data = operator.fn(data);
      }
    }
    for (const observer of this.observers) {
      observer(data);
    }
  }

  // Прописываем операторы.
  filter(predicate) {
    this.operators.push({ name: "filter", fn: predicate });
    return this;
  }

  map(callback) {
    this.operators.push({ name: "map", fn: callback });
    return this;
  }
}

// Usage

const randomChar = () => String
  .fromCharCode(Math.floor((Math.random() * 25) + 97));

const observable = new Observable()
  .filter(char => !"aeiou".includes(char)) // Проверяем фильтром чтобы вот такие буквы не входили в отданные данные.
  .map(char => char.toUpperCase());

const timer = setInterval(() => {
  const char = randomChar();
  observable.notify(char);
}, 200);

let count = 0;

const observer = char => {
  process.stdout.write(char);
  count++;
  if (count > 50) {
    clearInterval(timer);
    process.stdout.write("\n");
  }
};

observable.subscribe(observer);
