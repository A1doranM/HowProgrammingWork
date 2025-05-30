"use strict";

// Предыдущий пример но в функциональном стиле.
// Инстанс теперь аргумент функции который вернется из синглтона, внутри лямбда
// которая сразу вызывается и ей передается
// пустой объект который попадает в инстанс и потом все время возвращается оттуда.
const singleton = (
  (instance) => () =>
    instance
)({});

// Usage

console.assert(singleton() === singleton());
console.log("instances are equal");
