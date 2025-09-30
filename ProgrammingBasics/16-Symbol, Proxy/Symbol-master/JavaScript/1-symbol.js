"use strict";

// Символ это ссылочный тип данных, который в памяти занимает размер одного машинного слова.
// 32, или 64 бита. Под капотом это просто ссылка на определенную область памяти. А вот хранить
// по этой ссылке мы можем значение любого размера, хоть гигабайт, так как символ просто будет
// указывать на эту область памяти.

const symbol1 = Symbol(); // Символы могут быть безымянными.
const symbol2 = Symbol();

console.dir(symbol1);
console.log(JSON.stringify(symbol1)); // Символ не умеет сериализоваться в JSON.

const eq1 = symbol1 === symbol2; // Символы с одинаковым именем не равны друг другу.
console.log("Symbol() === Symbol() :", eq1);

const symbol3 = Symbol("name"); // А могут быть именными.
const symbol4 = Symbol("name");

const eq2 = symbol3 === symbol4;
console.log("Symbol(\"name\") === Symbol(\"name\") :", eq2);
