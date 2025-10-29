'use strict';

const persons = [
  { name: 'Marcus Aurelius', city: 'Rome', born: 121 },
  { name: 'Victor Glushkov', city: 'Rostov on Don', born: 1923 },
  { name: 'Ibn Arabi', city: 'Murcia', born: 1165 },
  { name: 'Mao Zedong', city: 'Shaoshan', born: 1893 },
  { name: 'Rene Descartes', city: 'La Haye en Touraine', born: 1596 },
];

const sortStrategy = (options) => {
  const field = Object.keys(options)[0];
  const order = options[field] === 'asc' ? 1 : -1;
  return (a, b) => (a[field] < b[field] ? -order : order);
};

console.group('Sort strategy: descending by born year');
{
  const strategy = sortStrategy({ born: 'desc' });
  const output = persons.toSorted(strategy);
  console.table(output);
}
console.groupEnd();

console.group('Sort strategy: ascending by name alphabetically');
{
  const strategy = sortStrategy({ name: 'asc' });
  const output = persons.toSorted(strategy);
  console.table(output);
}
console.groupEnd();

console.group('Filter strategy: single word city name');
{
  const strategy = (person) => person.city.split(' ').length === 1;
  const output = persons.filter(strategy);
  console.table(output);
}
console.groupEnd();

console.group('Reduce strategy: sum born years');
{
  const strategy = (acc, person) => acc + person.born;
  const output = persons.reduce(strategy, 0);
  console.table(output);
}
console.groupEnd();
