"use strict";

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
