"use strict";

const data = { name: "Marcus Aurelius", city: "Rome", born: 121 };

const person = new Proxy(data, {
  has(obj, key) { // Перехватываем has, который будет срабатывать каждый раз когда кто-то будет
                                 // проверять наличие свойства при помощи ключевого слова in.
    console.log("check", key);
    return (key in obj || key === "age");
  },
  get(obj, key) {
    console.log("get", key);
    if (key === "age") {
      return (
        new Date().getFullYear() -
        new Date(obj.born.toString()).getFullYear()
      );
    }
    return obj[key];
  }
});

console.log("Try \"age\" in person");
if ("age" in person) { // Например так.
  console.log("Try person.age");
  if (person.age) {
    console.log("Try person[\"age\"]");
    if (person["age"]) { // А вот при таком обращении has не вызывается.
      console.log({
        born: person.born,
        age: person.age
      });
    }
  }
}

console.dir(person);
