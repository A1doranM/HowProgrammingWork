"use strict";

const arr = new Array(10);
console.dir({ arr });

const even = [2, 4, 6, 8, 10, 12];
console.dir({ even });

console.dir({
  length: even.length,
  first: even[0],
  last: even[even.length - 1]
});

console.dir({
  "even.slice(1, 4)": even.slice(1, 4),
  "even.splice(2, 4, 3, 7, 9)": even.splice(2, 4, 3, 7, 9)
});
