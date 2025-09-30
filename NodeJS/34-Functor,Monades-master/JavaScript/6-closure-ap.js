"use strict";

// Почти тоже самое но на замыканиях.
// Такой функтор с функцией chain называется уже монадой.

const maybe = (x) => { // Замыкаем X
  const map = (fn) => maybe(x ? fn(x) : null); // Создаем map
  const ap = (functor) => functor.map((f) => (x && f ? f(x) : null)); // apply
  const chain = (f) => f(x); // chain
  return Object.assign(map, { map, ap, chain }); // К map примешиваем две другие функции.
};

// Usage

const twice = (x) => x * 2;
const inc = (x) => ++x;

maybe(5)(twice)(inc)(console.log);
maybe(5).map(twice).map(inc).map(console.log);
maybe(5)(twice).ap(maybe(inc))(console.log);
maybe(5)(twice).ap(maybe())(console.log);
maybe(5).chain((x) => maybe(x * 2))(inc)(console.log);
maybe(5).chain((x) => maybe(x * 2)).map(inc)(console.log);
