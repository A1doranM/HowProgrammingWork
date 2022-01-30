"use strict";

// WeakSet работает так же как WeakMap, но класть в него можно только объекты.

const cities = new Set([
  { name: "Beijing" },
  { name: "Kiev" },
  { name: "London" },
  { name: "Baghdad" },
]);

const list = new WeakSet();
for (const city of cities) {
  console.log("Add city", city, "to WeakSet");
  list.add(city);
}

console.dir({ cities, list });

const iterator = cities.values();

const beijing = iterator.next().value;
console.log("select", beijing);

iterator.next();

const london = iterator.next().value;
console.log("select", london);

cities.delete(london);
console.log("remove", london, "from Set");

list.delete(beijing);
console.log("remove", beijing, "from WeakSet");

for (const city of cities) {
  console.log("City", city, "in WeakSet", list.has(city));
}
