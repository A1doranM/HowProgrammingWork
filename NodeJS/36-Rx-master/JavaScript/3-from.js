"use strict";

const { from } = require("rxjs");
const { map, filter, max } = require("rxjs/operators");

const source = from([7, 10, 5, 5, 3, 12]);

const destination = source.pipe(
  filter((x) => x % 2 === 0),
  map((x) => x * 2),
  max()
);

source.subscribe((x) => {
  console.dir({ x });
});

destination.subscribe((res) => {
  console.dir({ res });
});

console.dir({ source, destination });
