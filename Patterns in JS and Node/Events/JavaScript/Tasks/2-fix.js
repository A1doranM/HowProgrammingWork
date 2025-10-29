'use strict';

// Task: prevent termination on error and fix code
// to prevent withdraw more than given limit
// Add 'buy' event handler
// Add 'done' event handler and emit it after iteration

const EventEmitter = require('node:events');

class Purchase extends EventEmitter {
  constructor({ limit }) {
    super();
    this.items = [];
    this.total = 0;
    this.on('add', (item) => {
      const total = this.total + item.price;
      if (total > limit) {
        this.emit('error', new Error('Limit reached'));
        return;
      }
      this.total = total;
      this.items.push(item);
      this.emit('buy', item);
    });
  }
}

const wallet = { money: 1600 };
console.log({ wallet });

const purchase = new Purchase({ limit: wallet.money });

purchase.on('add', (item) => {
  wallet.money -= item.price;
  console.log({ item, wallet });
});

const electronics = [
  { name: 'Laptop', price: 1500 },
  { name: 'Keyboard', price: 100 },
  { name: 'HDMI cable', price: 10 },
];

for (const item of electronics) {
  purchase.emit('add', item);
}

console.log({ wallet });
console.log({ purchase });
