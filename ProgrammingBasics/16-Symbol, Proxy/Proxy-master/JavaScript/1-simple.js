"use strict";

// Прокси - это паттерн проектирования который оборачивает другой объект и перехватывает
// все, или определенные вызовы к нему.

const data = { name: "Marcus Aurelius", city: "Rome", born: 121 };

const person = new Proxy(data, {}); // Проксируем объект.

console.dir({ "person.born": person.born }); // Обращаемся к свойствам прокси, но на самом деле обращение происходит
console.dir({ "person.year": person.year }); // к свойствам data.

for (const key in person) {
  console.dir({
    key,
    value: person[key],
  });
}
