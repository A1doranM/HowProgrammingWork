'use strict';

const timers = require('node:timers/promises');

const randomTimeout = () => timers.setTimeout(Math.random() * 500);

const checkAvailability = async (items, state) => {
  await randomTimeout();
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

const processPayment = async (payment) => {
  await randomTimeout();
  console.log({ payment });
};

const shipGoods = async (items, state) => {
  await randomTimeout();
  for (const { id, quantity } of items) {
    state[id] -= quantity;
  }
  console.log({ ship: items });
};

const sendOrderConfirmation = async (email) => {
  await randomTimeout();
  console.log({ email });
};

const buy = async (order, state) => {
  const available = await checkAvailability(order.items, state);
  if (available) {
    await processPayment(order.paymentDetails);
    await shipGoods(order.items, state);
    await sendOrderConfirmation(order.userEmail);
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
}, 10);

setTimeout(() => {
  const order2 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 1 }],
    userEmail: 'customer@example.com',
  };
  buy(order2, state);
}, 10);

setTimeout(() => {
  const order3 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 2 }],
    userEmail: 'customer@example.com',
  };
  buy(order3, state);
}, 10);
