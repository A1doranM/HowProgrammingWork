const b1 = Buffer.from([1, 2, 3, 4, 5, 6]);
const b2 = Buffer.from([10, 11, 12]);
const b3 = Buffer.alloc(10).fill("A");

const buffer = Buffer.concat([b1, b2, b3]);

console.log(buffer);
console.log(buffer.toString());