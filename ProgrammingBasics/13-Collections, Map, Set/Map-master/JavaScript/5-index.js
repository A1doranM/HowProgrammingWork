"use strict";

const fs = require("fs");

const getDataset = (file) => {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.shift();
  lines.pop();
  return lines.map((line) => line.split(","));
};

const buildIndex = (ds, col) => {
  const index = new Map();
  for (const record of ds) {
    index.set(record[col], record);
  }
  return index;
};

// Usage

const dataset = getDataset("./cities.csv");
console.log(dataset);

const byName = buildIndex(dataset, 0);
console.log(byName);

const byPopulation = buildIndex(dataset, 1);
console.log(byPopulation);

const delhi = byName.get("Delhi");
console.log(delhi);

const record = byPopulation.get("21516000");
console.log(record);
