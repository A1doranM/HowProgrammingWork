"use strict";

// Наблюдатель это достаточно простая идея.
// У нас должны быть две программные абстракции, одна порождает события, другая обрабатывает.

// Пример с функцией генерирующей случайные буквы латинского алфавита.
const randomChar = () => String
  .fromCharCode(Math.floor((Math.random() * 25) + 97));

// Делаем такой наблюдатель который будет генерировать буквы раз в пару секунд.
// Subscribe подписывает наблюдателя на определенное событие.
const subscribe = observer => {
  const observable = { observer };
  setInterval(() => {
    const char = randomChar();
    observer(char);
  }, 200);
  return observable;
};

// Usage

let count = 0;

const observer = char => {
  process.stdout.write(char);
  count++;
  if (count > 50) {
    process.stdout.write("\n");
    process.exit(0);
  }
};

const observable = subscribe(observer);

console.dir({ observer, observable });
