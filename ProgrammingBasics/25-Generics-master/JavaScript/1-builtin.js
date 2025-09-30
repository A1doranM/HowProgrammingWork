"use strict";

// Суть дженерика это использование структуры данных не задавая типа хранимых в ней данных.
// На самом деле в JS все дженерики, мы ведь можем засовывать в массив что угодно, или передавать в функцию, и т.д.

console.log(Math.max(1, 2));
console.log(Math.max(1, 2.2));
console.log(Math.max(1.5, 2.5));
console.log(Math.max("2.5", "1.5"));
console.log(Math.max("2.5", 1.5));

const array = [1, "6", 3, 4, 5, false, 3.5, "last", 2, true];
console.dir({ array });

array.sort(); // compare as unicode strings by default
console.dir({ array });

array.sort((a, b) => a - b); // Функция дженерик.
console.dir({ array });
