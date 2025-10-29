'use strict';

// Task: use `on` and `AsyncIterator` to iterate all items
// in purchase emitted `into EventEmitter`

const { EventEmitter, on } = require('node:events');

const purchase = new EventEmitter();

const electronics = [
  { name: 'Laptop', price: 1500 },
  { name: 'Keyboard', price: 100 },
  { name: 'HDMI cable', price: 10 },
];

const iterator = on(purchase, 'add');
console.log({ iterator });

for (const item of electronics) {
  purchase.emit('add', item);
}
