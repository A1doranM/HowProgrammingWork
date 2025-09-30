type Container<T> = { value: T };

// Usage

const container1: Container<number> = { value: 100 };
console.dir({ container1 });

const person = { name: "Marcus", born: 121, city: "Roma" };
const container2: Container<Object> = { value: person };
console.dir({ container2 });
