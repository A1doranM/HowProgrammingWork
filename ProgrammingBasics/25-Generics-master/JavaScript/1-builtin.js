"use strict";

console.log(Math.max(1, 2));
console.log(Math.max(1, 2.2));
console.log(Math.max(1.5, 2.5));
console.log(Math.max("2.5", "1.5"));
console.log(Math.max("2.5", 1.5));

const array = [1, "6", 3, 4, 5, false, 3.5, "last", 2, true];
console.dir({ array });

array.sort(); // compare as unicode strings by default
console.dir({ array });

array.sort((a, b) => a - b);
console.dir({ array });
