"use strict";

// Пример с операторами и пайпом.

const { Observable } = require("rxjs");
const { filter, map } = require("rxjs/operators");

const randomChar = () => String
  .fromCharCode(Math.floor((Math.random() * 25) + 97));

const source = new Observable((subscriber) => {
  setInterval(() => {
    const char = randomChar();
    subscriber.next(char);
  }, 200);
});

// Здесь под капотом будет на каждый переданный оператор создаваться новый поток
// в который будут пайпиться результаты предыдущего оператора. Тоесть создается поток
// для surce.pipe(filter()).pipe(map()) и т.д.
const destination = source.pipe(
  filter((char) => !"aeiou".includes(char)),
  map((char) => char.toUpperCase())
);

let count = 0;

const observer = (char) => {
  process.stdout.write(char);
  count++;
  if (count > 50) {
    process.stdout.write("\n");
    process.exit(0);
  }
};

destination.subscribe(observer);

console.dir({ observer, source, destination });
