'use strict';

const timers = require('node:timers/promises');

const randomTimeout = () => timers.setTimeout(Math.random() * 500);

const checkAvailability = async (items, state) => {
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
  await randomTimeout();
  return true;
};

const processPayment = async (payment) => {
  console.log({ payment });
  await randomTimeout();
};

const shipGoods = async (items, state) => {
  for (const { id, quantity } of items) {
    state[id] -= quantity;
  }
  console.log({ ship: items });
  await randomTimeout();
};

const sendOrderConfirmation = async (email) => {
  console.log({ email });
  await randomTimeout();
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

const main = async () => {
  const id = '1722';
  const state = { [id]: 5 };
  const name = 'A4 Paper; 500 sheets; 75 Gsm';

  const order1 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 3 }],
    userEmail: 'customer@example.com',
  };
  await buy(order1, state);

  const order2 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 1 }],
    userEmail: 'customer@example.com',
  };
  await buy(order2, state);

  const order3 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 2 }],
    userEmail: 'customer@example.com',
  };
  await buy(order3, state);
};

main();
