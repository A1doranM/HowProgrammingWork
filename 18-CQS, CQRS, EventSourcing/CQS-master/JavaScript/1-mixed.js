"use strict";

// Command Query Separation - разделение методов которые занимаются распределением и выборкой данных на разные уровни.
// Одни методы запрашивают состояние, а другие мутируют

const adder = (value) => (x) => value += x;

const a1 = adder(2);

console.log(a1(7));
console.log(a1(3));
console.log(a1(8));
