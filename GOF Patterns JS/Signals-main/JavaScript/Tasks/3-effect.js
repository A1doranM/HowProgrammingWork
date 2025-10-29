'use strict';

// npm install @preact/signals-core --save
const { signal, effect } = require('@preact/signals-core');

// Task: rewrite code to use preact `effect` function;
// implement iteration to increment total
// and printing purchase total after each change

const electronics = [
  { name: 'Laptop', price: 1500 },
  { name: 'Keyboard', price: 100 },
  { name: 'HDMI cable', price: 10 },
];

const total = signal(0);

effect(() => {
  console.log(electronics);
  console.log({ total });
});
