"use strict";

const cityPopulation = new Map();

cityPopulation.set("Shanghai", 24256800);
cityPopulation.set("Beijing",  21516000);
cityPopulation.set("Delhi",    16787941);
cityPopulation.set("Lagos",    16060303);

cityPopulation.delete("Shanghai");

if (cityPopulation.has("Beijing")) {
  console.log("Beijing:", cityPopulation.get("Beijing"));
}

if (!cityPopulation.has("Shanghai")) {
  console.log("no data for Shanghai");
}

console.log("size:", cityPopulation.size);
console.log("keys:", [...cityPopulation.keys()]);
