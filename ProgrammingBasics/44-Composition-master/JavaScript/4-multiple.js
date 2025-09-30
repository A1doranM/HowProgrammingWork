"use strict";

// Пример с любым количеством функций, но при этом сама композиция принимает
// всего один аргумент.

const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
// При вызове редьюс, начальный аргумент Х будет передан в V, после чего
// исполнится функция и то что она вернет опять попадет в V, и выполнится
// следующа функция и т.д.
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

// Usage

const upperFirst = word => word.charAt(0).toUpperCase() + word.slice(1);
const upperCapital = s => s.split(" ").map(upperFirst).join(" ");
const lower = s => s.toLowerCase();
const trim = s => s.trim();

const s = "   MARCUS AURELIUS   ";
console.log(s);
console.log(`lower("${s}") = "${lower(s)}"`);
console.log(`upperCapital("${s}") = "${upperCapital(s)}"`);

{
  console.log("Use compose");
  const capitalize = compose(upperCapital, lower, trim);
  console.log(`capitalize("${s}") = "${capitalize(s)}"`);
}
{
  console.log("Use pipe");
  const capitalize = pipe(trim, lower, upperCapital);
  console.log(`capitalize("${s}") = "${capitalize(s)}"`);
}
