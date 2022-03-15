"use strict";

const person = { name: "Marcus Aurelius" };
// Проверяем наследуемый ли объект, запрещаем наследование.
console.log({ isExtensible: Reflect.isExtensible(person) });
console.log({ success: Reflect.preventExtensions(person) });
// person.city = "Roma"; // TypeError
console.log({ isExtensible: Reflect.isExtensible(person) });
