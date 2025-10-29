'use strict';

// Task: rewrite EventTarget to EventEmitter
// Hint: you need Node.js >= v19.0.0

const purchase = new EventTarget();

purchase.addEventListener('buy', (event) => {
  const bought = event.detail;
  console.log({ bought });
});

const electronics = [
  { name: 'Laptop', price: 1500 },
  { name: 'Keyboard', price: 100 },
  { name: 'HDMI cable', price: 10 },
];

for (const item of electronics) {
  const data = { detail: item };
  purchase.dispatchEvent(new CustomEvent('buy', data));
}
