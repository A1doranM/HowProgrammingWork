"use strict";

const numbers = [5, 2, 4, 1, 3];
const { max, min } = Math;
const { apply } = Reflect;

const maxNumber = apply(max, null, numbers);
const minNumber = apply(min, null, numbers);

// const maxNumber = max.apply(null, numbers);
// const minNumber = min.apply(null, numbers);

console.dir({ maxNumber, minNumber });
