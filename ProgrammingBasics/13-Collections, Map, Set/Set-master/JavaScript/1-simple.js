"use strict";

const cities = new Set();

cities.add("Beijing");

["Kiev", "London", "Baghdad"].forEach((city) => cities.add(city));

cities.delete("Baghdad");

console.dir({ cities });

if (cities.has("Kiev")) {
  console.log("cities contains Kiev");
}

console.dir({ keys: cities.keys() });
console.dir({ values: cities.values() });
console.dir({ entries: cities.entries() });

cities.clear();
