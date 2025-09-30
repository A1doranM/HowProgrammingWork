"use strict";

// Функторы - это такие себе функциональные объекты.
// Функтор может быть сделан, из типа, из класса и из прототипа.

// Функтор на прототипах
function Maybe(x) { // Конструктор прототипа Maybe
  this.x = x;
}

Maybe.prototype.map = function(fn) { // у него есть метод map который
  if (this.x && fn) { // принимает функцию и проверяет если есть X и есть функция
    return new Maybe(fn(this.x)); // создаем новый экземпляр Maybe передав ему результат исполнения функции.
  } else {
    return new Maybe(null); // Иначе просто создаем Maybe с аргументом null.
  }
};

// Usage

new Maybe(5).map().map(console.log);
new Maybe(5).map((x) => x * 2).map(console.log);
new Maybe(null).map((x) => x * 2).map(console.log);
