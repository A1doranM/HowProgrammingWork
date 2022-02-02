"use strict";

const symbol1 = Symbol.for("name");
const symbol2 = Symbol.for("name");

if (symbol1 === symbol2) {
  console.log(
    "Symbols with identical description " +
    "from global registry list are equal"
  );
}

console.log("symbol1:", symbol1);
console.log("Symbol("name"):", Symbol("name"));
console.log("Symbol.for("name"):", Symbol.for("name"));

console.log(Symbol("name") === Symbol.for("name"));
console.log(Symbol.for("name") === Symbol.for("name"));

const symbol3 = Symbol("name2");

console.log(
  "key for symbol from global registry list:",
  Symbol.keyFor(symbol1)
);
console.log(
  "key for symbol which isnt in global registry list:",
  Symbol.keyFor(symbol3)
);

console.log(symbol1[Symbol.toPrimitive]());
