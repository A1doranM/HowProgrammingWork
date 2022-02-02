"use strict";

const data = { name: "Marcus Aurelius", city: "Rome", born: 121 };

const person = new Proxy(data, {
  deleteProperty(obj, key) { // Перехватываем удаление свойства при помощи оператора delete.
    console.log("delete", key);
    return true; // Должен возвращать успешно ли удалено свойство.
  }
});

console.log(person);
delete person.name; // Пример.
console.log(person);
