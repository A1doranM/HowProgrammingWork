"use strict";

// Более правильный пример. Отображение через функцию.

const partial = (fn, ...args) => (...rest) => fn(...args, ...rest);

// Projection

// 1. Берем ключи из переданного нам объекта.
// 2. Два вложенных редьюса, наружный перекладывает поля, но
// 3. каждое поле проходит через второй редьюс который берет поле, берет функцию,
// и если будет лежать следующая функция то ее тоже выполнить.
// Он проходит по ключам meta[key]. Пиздец код конечно, читать невозможно.

const projection = (meta, obj) => Object.keys(meta)
  .reduce((hash, key) => (hash[key] = meta[key]
    .reduce((val, fn, i) => (i ? fn(val) : obj[fn]), null), hash), {});

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
  name: ["name"], // Ключ которое надо сгенерировать в записях нового датасета.
  place: ["city", s => "<" + s.toUpperCase() + ">"], // Как генерировать поле place из city.
  age: ["born", year => ( // Как генерировать поле age из age.
    new Date().getFullYear() - new Date(year.toString()).getFullYear()
  )]
};

// Usage

const p1 = partial(projection, md);
const data = persons.map(p1);
console.dir(data);
