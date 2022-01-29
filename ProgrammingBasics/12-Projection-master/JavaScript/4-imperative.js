"use strict";

// Projection

// Императивный пример с более читаемым кодом.

const projection = meta => {
  const keys = Object.keys(meta);
  return obj => {
    const hash = {};
    keys.forEach(key => { // Перебираем поля.
      const def = meta[key]; // Забираем определитель поля из переданных данных.
      const [field, fn] = def; // Забираем из него имя поля и функцию его преобразования.
      const val = obj[field]; // Забираем из изначально объекта это поле.
      hash[key] = fn ? fn(val) : val; // Если была функция то запускаем ее, иначе сразу записываем значение.
    });
    return hash;
  };
};

// Dataset

const persons = [
  { name: "Marcus Aurelius", city: "Rome", born: 121 },
  { name: "Victor Glushkov", city: "Rostov on Don", born: 1923 },
  { name: "Ibn Arabi", city: "Murcia", born: 1165 },
  { name: "Mao Zedong", city: "Shaoshan", born: 1893 },
  { name: "Rene Descartes", city: "La Haye en Touraine", born: 1596 },
];

// Metadata

const md = {
  name: ["name"],
  place: ["city", s => `<${s.toUpperCase()}>`],
  age: ["born", year => (
    new Date().getFullYear() -
    new Date(year.toString()).getFullYear()
  )]
};

// Usage

const p1 = projection(md);
const data = persons.map(p1);
console.dir(data);
