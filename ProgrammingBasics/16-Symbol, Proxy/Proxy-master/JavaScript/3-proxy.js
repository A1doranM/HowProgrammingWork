"use strict";

// Перехватываем get, set с помощью прокси.

const data = { name: "Marcus Aurelius", city: "Rome", born: 121 };

const person = new Proxy(data, {
  get(obj, key) { // Перехват get, перехватчики первым аргументом получают объект который проксировали.
    console.log("get", key);
    return obj[key];
  },
  set(obj, key, val) {  // Перехватчик set, после первого ключа идут имя свойства и значение.
    console.log("set", key, val);
    obj[key] = val;
    return true;
  }
});

console.dir({ "person.born": person.born });
console.dir({ "person.year": person.year });

for (const key in person) {
  console.dir({ key: person[key] });
}

person.name = "Marcus";
