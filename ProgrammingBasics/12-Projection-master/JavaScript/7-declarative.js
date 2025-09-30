"use strict";

// Projection

// Расширенный пример. Теперь проекцию можно вкладывать внутри проекции декларативно.

const projection = meta => {
  const keys = Object.keys(meta); // Кешируем ключи.
  return obj => {
    const hash = {};
    for (const key of keys) { // Идем по ним.
      const def = meta[key];
      const [name, transform] = def; // Забираем имя проекции и функцию которая ее формирует.
                                    // Например для "place: ["city", s => `<${s.toUpperCase()}>`],"
                                    // заберем "city" и "s => `<${s.toUpperCase()}>`"
      let val = obj[name]; // Забираем значение поля из оригинального объекта по имени.
      if (val) { // Если есть значение
        if (transform) { // проверяем есть ли формирующая функция, или там сразу идет значение для записи
          val = typeof transform === "function"  // если это функция
              ? transform(val) // выполняем функцию, либо если там идет вложенная проекция
              : val.map(projection(transform)); // запускаем для каждого ее поля функцию проекции.
        }
        hash[key] = val; // Запишем значение.
      }
    }
    return hash;
  };
};

// Dataset

const persons = [
  { name: "Marcus Aurelius", city: "Rome", born: 121, places: [
    { name: "Shanghai", population: 24256800, country: "China" },
    { name: "Beijing", population: 21516000, country: "China" },
    { name: "Delhi", population: 16787941, country: "India" }
  ] },
  { name: "Victor Glushkov", city: "Rostov on Don", born: 1923, places: [
    { name: "Lagos", population: 16060303, country: "Nigeria" },
    { name: "Delhi", population: 16787941, country: "India" },
    { name: "Tianjin", population: 15200000, country: "China" }
  ] },
  { name: "Ibn Arabi", city: "Murcia", born: 1165, places: [
    { name: "Beijing" }
  ] },
  { name: "Mao Zedong", city: "Shaoshan", born: 1893 },
  { name: "Rene Descartes", city: "La Haye en Touraine", born: 1596, places: [
    { name: "Karachi", population: 14910352, country: "Pakistan" },
    { name: "Istanbul", population: 14160467, country: "Turkey" },
    { name: "Tianjin", population: 15200000, country: "China" }
  ] },
];

// Metadata

const md = {
  name: ["name"],
  place: ["city", s => `<${s.toUpperCase()}>`],
  born: ["born"],
  age: ["born", year => (
    new Date().getFullYear() -
    new Date(year.toString()).getFullYear()
  )],
  places: ["places", { // Вкладываем еще одну проекцию внутрь.
    address: ["name", s => s.toUpperCase()],
    population: ["population"]
  }]
};

// Usage

const p = projection(md);
const data = persons.map(p);
console.dir(data, { depth: 10 });
