"use strict";

const symbol1 = Symbol.for("name"); // Вызов for позволяет не создавать при каждом вызове новый символ.
const symbol2 = Symbol.for("name"); // Первый раз он создаст его, а дальше будет возвращать ссылку на существующий.

if (symbol1 === symbol2) {
  console.log(
    "Symbols with identical description " +
    "from global registry list are equal"
  );
}

console.log("symbol1:", symbol1);
console.log("Symbol("name"):", Symbol("name"));
console.log("Symbol.for("name"):", Symbol.for("name"));

console.log(Symbol("name") === Symbol.for("name")); // false.
console.log(Symbol.for("name") === Symbol.for("name")); // true.

const symbol3 = Symbol("name2");

console.log(
  "key for symbol from global registry list:",
  Symbol.keyFor(symbol1) // keyFor ищет ключ для символа (но только для такого), который создан через
                         // Symbol.for() то есть для symbol1 вернется "name".
);
console.log(
  "key for symbol which isnt in global registry list:",
  Symbol.keyFor(symbol3) // А для symbol3 вернется undefined.
);

console.log(symbol1[Symbol.toPrimitive]());
