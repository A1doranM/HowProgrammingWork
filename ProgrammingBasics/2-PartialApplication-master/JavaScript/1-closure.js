"use strict";

// Частичное применение это когда мы берем одну фукнцию и используя ее в другой функции
// создаем новый функционал. Например ниже мы использую функцию логарифма создаем функцию
// которая может быть адаптирована под любой логарифм.

const { log: ln } = Math;
const log = (base, n) => ln(n) / ln(base); // Функция логарифма.

const createLog = (base) => (n) => log(base, n); // Расширеный логарифм.

// Usage
{
  const lg = createLog(10);
  const ln = createLog(Math.E);

  console.log("lg(5) =", lg(5));
  console.log("ln(5) =", ln(5));
}
