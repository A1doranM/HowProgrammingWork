"use strict";

// Проекции набора данных, это некие преобразования которые совершаются над данными,
// например SQL.

// Частично применяет функцию из двух аргументов в такую функцию у которой набор полей передается сразу,
// а часть передается уэе потом.
const partial = (fn, ...args) => (...rest) => fn(...args, ...rest);

const projection = (fields, obj) => Object.keys(obj) // Вычисляем массив ключей в объекте который нужно преобразовывать.
  .filter(field => fields.includes(field)) // Фильтруем ключи оставляя только те которые нам требуются.
  .reduce((hash, key) => (hash[key] = obj[key], hash), {}); // С помощью редьюс перекладываем один объект в другой
                                                                  // берем для этого вторым объектом редьюса второй пустой объект.
                                                                // затем отфильтрованные поля перемещаем в объект хэш.
                                                            // Такой способ хорош для мелких объектов, если выборка будет большой
                                                            // лучше использовать цикл так как редьюс работает через рекурсию
                                                            // и наращивает стек вызовов.

// Dataset

const persons = [
  { name: "Marcus Aurelius", city: "Rome", born: 121 },
  { name: "Victor Glushkov", city: "Rostov on Don", born: 1923 },
  { name: "Ibn Arabi", city: "Murcia", born: 1165 },
  { name: "Mao Zedong", city: "Shaoshan", born: 1893 },
  { name: "Rene Descartes", city: "La Haye en Touraine", born: 1596 },
];

// Usage

const p1 = partial(projection, ["name", "born"]);
const p2 = partial(projection, ["name"]);

const data = persons.map(p1).map(p2);
console.dir(data);
