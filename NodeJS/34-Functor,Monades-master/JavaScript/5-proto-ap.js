"use strict";

// Функтор с улучшеным Map

function Maybe(x) {
  this.x = x;
}

Maybe.prototype.map = function(fn) {
  const res = (this.x && fn) ? fn(this.x) : null;
  return res instanceof Maybe ? res : new Maybe(res); // Если нам из функции уже вернулся Maybe то просто возвращаем его,
                                                      // иначе рекурсивно создадим Maybe.
};

Maybe.prototype.ap = function(functor) { // Функция apply которая принимает функтор и затем
  return this.map((val) => functor.map((f) => f(val))); // делаем двойной map, для того чтобы из текущего функтора достать val
                                                        // затем берем функтор и из него достаем функцию передавая ей значение.
                                                        // А то что вернулось становится результатом apply.
};

// Usage

const a = new Maybe(5);
const f1 = new Maybe((x) => x * 2);
const f2 = new Maybe((x) => ++x);

a.ap(f1).ap(f2).map(console.log); // а, это контейнер с 5, к нему мы применяем контейнер с умножением и затем инкремент.

// Это пример аппликативного функтора - такой функтор умеет распаковать функтор со значением, распаковать функтор с функцией
// и применить функцию к значению, после чего запаковать все это в функтор.

