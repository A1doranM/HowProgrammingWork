"use strict";

const cityPopulation = new Map();

cityPopulation.set("Shanghai", 24256800);
cityPopulation.set("Beijing",  21516000);
cityPopulation.set("Delhi",    16787941);
cityPopulation.set("Lagos",    16060303);

console.log("\nKeys");
console.log(cityPopulation.keys());

const keys = [...cityPopulation.keys()];
console.log(keys);

console.log("\nValues");
console.log(cityPopulation.values());

console.log("\nEntries");
console.log(cityPopulation.entries());

cityPopulation.delete("Shanghai");
console.log("\nEntries after delete(\"Shanghai\")");
console.log(cityPopulation.entries());

cityPopulation.clear();
console.log("\nEntries after clear");
console.log(cityPopulation.entries());
