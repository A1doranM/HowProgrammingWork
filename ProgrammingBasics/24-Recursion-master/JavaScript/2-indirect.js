"use strict";

// Тут у нас пример косвенной рекурсии, это когда одна функция вызывает другую, а та в свою очередь
// вызывает первую.

function f(x) {
  return g(x);
}

function g(x) {
  return f(x);
}

console.log(f(0));
