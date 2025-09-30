"use strict";

const persons = [
  { name: "Marcus Aurelius", city: "Rome", born: 121 },
  { name: "Victor Glushkov", city: "Rostov on Don", born: 1923 },
  { name: "Ibn Arabi", city: "Murcia", born: 1165 },
  { name: "Mao Zedong", city: "Shaoshan", born: 1893 },
  { name: "Rene Descartes", city: "La Haye en Touraine", born: 1596 },
];

console.group("Sort strategy: descending by born year");
{
  const strategy = (a, b) => (a.born < b.born ? 1 : -1);
  persons.sort(strategy);
  console.table(persons);
}
console.groupEnd();

console.group("Sort strategy: ascending by name alphabetically");
{
  const strategy = (a, b) => (a.name > b.name ? 1 : -1);
  persons.sort(strategy);
  console.table(persons);
}
console.groupEnd();

console.group("Filter strategy: single word city name");
{
  const strategy = (person) => person.city.split(" ").length === 1;
  const res = persons.filter(strategy);
  console.table(res);
}
console.groupEnd();

console.group("Reduce strategy: sum born years");
{
  const strategy = (acc, person) => acc + person.born;
  const res = persons.reduce(strategy, 0);
  console.table(res);
}
console.groupEnd();
