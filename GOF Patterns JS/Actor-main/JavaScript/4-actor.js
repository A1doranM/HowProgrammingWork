'use strict';

const timers = require('node:timers/promises');
const randomTimeout = () => timers.setTimeout(Math.random() * 500);

class Actor {
  #queue = [];
  #processing = false;
  #behavior = null;
  #state = null;

  constructor(behavior, state) {
    this.#behavior = behavior;
    this.#state = state;
  }

  async send(message) {
    this.#queue.push(message);
    await this.#process();
  }

  async #process() {
    if (this.#processing) return;
    this.#processing = true;

    while (this.#queue.length) {
      const message = this.#queue.shift();
      await this.#behavior(message, this.#state);
    }

    this.#processing = false;
  }
}

// Usage

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
  await randomTimeout();
  console.log({ ship: items });
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

const id = '1722';
const orderActor = new Actor(buy, { [id]: 5 });
const name = 'A4 Paper; 500 sheets; 75 Gsm';

setTimeout(() => {
  const order1 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 3 }],
    userEmail: 'customer@example.com',
  };
  orderActor.send(order1);
}, 10);

setTimeout(() => {
  const order2 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 1 }],
    userEmail: 'customer@example.com',
  };
  orderActor.send(order2);
}, 10);

setTimeout(() => {
  const order3 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 2 }],
    userEmail: 'customer@example.com',
  };
  orderActor.send(order3);
}, 10);
