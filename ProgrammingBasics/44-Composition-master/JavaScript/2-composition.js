"use strict";

// Композиция - тут к нам приходит 2 функции, а возвращается функция принимаюшая
// аргумент, и затем она применит по очереди две переданные ей ранее функции.
const compose = (f, g) => x => f(g(x));

// Usage

const upperFirst = word => word.charAt(0).toUpperCase() + word.slice(1);
const upperCapital = s => s.split(" ").map(upperFirst).join(" ");
const lower = s => s.toLowerCase();

const capitalize = compose(upperCapital, lower);

const s = "MARCUS AURELIUS";
console.log(s);
console.log(`lower("${s}") = "${lower(s)}"`);
console.log(`upperCapital("${s}") = "${upperCapital(s)}"`);
console.log(`capitalize("${s}") = "${capitalize(s)}"`);
