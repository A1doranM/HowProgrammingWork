"use strict";

const cities = {
  beijing: { name: "Beijing" },
  kiev: { name: "Kiev" },
  london: { name: "London" },
  baghdad: { name: "Baghdad" },
};

const capitalOf = new WeakMap();
capitalOf.set(cities.beijing, "People\"s Republic of China");
capitalOf.set(cities.kiev, "Ukraine");
capitalOf.set(cities.london, "United Kingdom");
capitalOf.set(cities.baghdad, "Iraq");

delete cities.london;
capitalOf.delete(cities.baghdad);

console.dir({ cities, capitalOf });
