'use strict';

/**
 * FILE PURPOSE: Baseline synchronous implementation (NO ACTOR PATTERN)
 *
 * This file demonstrates a simple, synchronous e-commerce order processing system
 * without any concurrency concerns. It works correctly because:
 * 1. All operations are synchronous
 * 2. JavaScript single-threaded execution ensures sequential processing
 * 3. No async operations means no interleaving of execution
 *
 * This is the starting point to understand the problem that Actor pattern solves.
 * The code is safe here ONLY because it's synchronous.
 */

/**
 * Check if requested items are available in inventory
 * @param {Array} items - Array of items to check [{id, quantity}]
 * @param {Object} state - Current inventory state {[itemId]: availableCount}
 * @returns {boolean} - true if all items available, false otherwise
 */
const checkAvailability = (items, state) => {
  console.log({ checkStart: items });
  for (const item of items) {
    const { id, quantity } = item;
    const count = state[id];
    if (quantity >= count) {
      console.log({ checkEnd: false });
      return false;
    }
  }
  console.log({ checkEnd: true });
  return true;
};

const processPayment = (payment) => {
  console.log({ payment });
};

const shipGoods = (items, state) => {
  for (const { id, quantity } of items) {
    state[id] -= quantity;
  }
  console.log({ ship: items });
};

const sendOrderConfirmation = (email) => {
  console.log({ email });
};

const buy = (order, state) => {
  const available = checkAvailability(order.items, state);
  if (available) {
    processPayment(order.paymentDetails);
    shipGoods(order.items, state);
    sendOrderConfirmation(order.userEmail);
  }
  console.log({ state });
};

const id = '1722';
const state = { [id]: 5 };
const name = 'A4 Paper; 500 sheets; 75 Gsm';

setTimeout(() => {
  const order1 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 3 }],
    userEmail: 'customer@example.com',
  };
  buy(order1, state);
}, 100);

setTimeout(() => {
  const order2 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 1 }],
    userEmail: 'customer@example.com',
  };
  buy(order2, state);
}, 100);

setTimeout(() => {
  const order3 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 2 }],
    userEmail: 'customer@example.com',
  };
  buy(order3, state);
}, 100);
