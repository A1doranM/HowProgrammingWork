"use strict";

const cityPopulation = new Map();

cityPopulation.set("Shanghai", 24256800);
cityPopulation.set("Beijing",  21516000);
cityPopulation.set("Delhi",    16787941);
cityPopulation.set("Lagos",    16060303);

for (const city of cityPopulation) {
  console.log(city);
}

for (const [name, population] of cityPopulation) {
  console.log(`Population of ${name} is ${population}`);
}
