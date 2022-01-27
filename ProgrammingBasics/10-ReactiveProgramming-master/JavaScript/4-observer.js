"use strict";

const { EventEmitter } = require("events");
const { max } = Math;

const ee = new EventEmitter();

const cities = [];

const variables = {
  maxDensity: 0,
  count: 0,
};

ee.on("city", (city) => {
  variables.count++;
  variables.maxDensity = max(variables.maxDensity, city.density);
  cities.push(city);
  cities.forEach((city) => {
    city.relative = Math.round(city.density * 100 / variables.maxDensity);
  });
  console.table(variables);
  console.table(cities);
});

ee.emit("city", {
  city: "Shanghai",
  population: 24256800,
  area: 6340,
  density: 3826,
  country: "China",
});

ee.emit("city", {
  city: "Beijing",
  population: 21516000,
  area: 16411,
  density: 1311,
  country: "China",
});

ee.emit("city", {
  city: "Delhi",
  population: 16787941,
  area: 1484,
  density: 11313,
  country: "India",
});
