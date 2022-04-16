"use strict";

// Даем возможность передавать события из одного Observable в другой.

class Observable {
  constructor() {
    this.observers = [];
    this.operators = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
    return this;
  }

  // Пайп принимает в себя операторы которые будут преобразовывать передаваемые события.
  pipe(...args) { // Принимаем все аргументы.
    this.operators.push(...args);
    const destination = new Observable(); // Точка назначения это еще один Observable.
    this.subscribe(data => destination.notify(data)); // Подписываем его на события нашего Observable
    return destination; // и отдаем.
  }

  notify(data) {
    if (this.observers.length === 0) return;
    for (const operator of this.operators) {
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
}

// Прописываем операторы.
const filter = predicate => ({ name: "filter", fn: predicate });
const map = callback => ({ name: "map", fn: callback });

// Usage

const randomChar = () => String
  .fromCharCode(Math.floor((Math.random() * 25) + 97));

// Destination будет принимать отфильтрованные и отмапленные данные.
const source = new Observable();

const destination = source.pipe(
  filter(char => !"aeiou".includes(char)),
  map(char => char.toUpperCase())
);

let count = 0;

const observer = char => {
  process.stdout.write(char);
  count++;
  if (count > 50) {
    process.stdout.write("\n");
    process.exit(0);
  }
};

destination.subscribe(observer); // Подписываемся на destination.

setInterval(() => {
  const char = randomChar();
  source.notify(char);
}, 200);

console.dir({ observer, source, destination });
