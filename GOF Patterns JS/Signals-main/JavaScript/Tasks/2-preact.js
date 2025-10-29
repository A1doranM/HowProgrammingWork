'use strict';

// npm install @preact/signals-core --save
const { signal, computed } = require('@preact/signals-core');

// Task: rewrite code to use preact `computed` signal
// for calculation purchase total

const electronics = [
  { name: 'Laptop', price: 1500 },
  { name: 'Keyboard', price: 100 },
  { name: 'HDMI cable', price: 10 },
];

const items = signal(electronics);

const total = (items) => {
  let result = 0;
  for (const item of items) {
    result += item.price;
  }
  return result;
};

console.log(`Total: ${total(items.value)}`);
console.log(computed);
