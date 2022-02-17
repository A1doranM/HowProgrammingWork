const sum = (a: any, b: any): any => a + b;

console.dir(sum(1, 2)); // 3
console.dir(sum(1, "2")); // "12"
console.dir(sum("1", 2)); // "12"
console.dir(sum("1", "2")); // "12"
console.dir(sum(true, true)); // 2
console.dir(sum(true, false)); // 1
console.dir(sum(false, false)); // 0
console.dir(sum(1.5, 2)); // 3.5
console.dir(sum("1.5", "2")); // "1.52"
