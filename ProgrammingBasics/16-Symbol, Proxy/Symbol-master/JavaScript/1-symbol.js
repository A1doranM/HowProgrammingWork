"use strict";

const symbol1 = Symbol();
const symbol2 = Symbol();

console.dir(symbol1);
console.log(JSON.stringify(symbol1));

const eq1 = symbol1 === symbol2;
console.log("Symbol() === Symbol() :", eq1);

const symbol3 = Symbol("name");
const symbol4 = Symbol("name");

const eq2 = symbol3 === symbol4;
console.log("Symbol(\"name\") === Symbol(\"name\") :", eq2);
