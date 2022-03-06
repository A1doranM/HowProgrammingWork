"use strict";

// Композиция функций это идея из функционального программирования.
// Сначала к аргументу применяется одна функция, потом ее результат попадает
// во вторую.
const compose = (f1, f2) => (x) => f2(f1(x));

// Usage

const inc = (x) => x + 1;
const twice = (x) => x * 2;

const f = compose(inc, twice);

console.log({ res: f(7) });
