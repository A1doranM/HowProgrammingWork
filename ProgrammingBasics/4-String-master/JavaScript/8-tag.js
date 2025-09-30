"use strict";
// Пример с созданием шаблонизирующей функции, первый аргумент это части строки
// которые идут вне блоков ${}, а дальше передаются аргументы внутри ${}.
const tag = (strings, ...values) => {
  console.dir({ strings, values });
};

// Usage

const greeting = "Hello";
const person = { name: "Marcus Aurelius" };

const text = tag`${greeting} ${person.name}!`;
console.dir({ text });
