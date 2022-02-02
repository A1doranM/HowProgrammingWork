"use strict";

const data = { name: "Marcus Aurelius", city: "Rome", _born: 121 };

const person = new Proxy(data, {
  ownKeys(obj) { // Переопределяем получение списка ключей при помощи Object.keys();
    return Object.keys(obj).filter(name => !name.startsWith("_")); // Например тут мы не отдадим поля которые начинаются с "_".
  }
});

console.dir(Object.keys(person));
