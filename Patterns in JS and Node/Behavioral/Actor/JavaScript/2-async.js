'use strict';

/**
 * FILE PURPOSE: Properly awaited async implementation (NO ACTOR PATTERN NEEDED)
 *
 * This file demonstrates async order processing with PROPER awaiting.
 * It's SAFE because:
 * 1. All async operations are properly awaited
 * 2. Orders are processed sequentially (await ensures one completes before next starts)
 * 3. No concurrent access to shared state
 *
 * This shows that Actor pattern is NOT needed if you can guarantee sequential
 * processing through proper async/await usage.
 *
 * Compare to: 3-unsafe.js (same async code but WITHOUT proper awaiting)
 */

const timers = require('node:timers/promises');

/**
 * Simulate random network/IO delay (0-500ms)
 * Represents real-world async operations like database queries, API calls
 */
const randomTimeout = () => timers.setTimeout(Math.random() * 500);

/**
 * Check item availability (now ASYNC to simulate database query)
 * @param {Array} items - Items to check
 * @param {Object} state - Current inventory state
 * @returns {Promise<boolean>} - true if available
 */
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
  await randomTimeout(); // Simulates async database query delay
  return true;
};

/**
 * Process payment asynchronously (simulates payment gateway call)
 * @param {Object} payment - Payment details
 */
const processPayment = async (payment) => {
  console.log({ payment });
  await randomTimeout(); // Simulates API call to payment processor
};

/**
 * Ship goods and update inventory (async database update)
 * @param {Array} items - Items to ship
 * @param {Object} state - Inventory state to update
 */
const shipGoods = async (items, state) => {
  // State mutation still happens synchronously (this part is instant)
  for (const { id, quantity } of items) {
    state[id] -= quantity;
  }
  console.log({ ship: items });
  await randomTimeout(); // Simulates async database write
};

/**
 * Send confirmation email asynchronously
 * @param {string} email - Customer email
 */
const sendOrderConfirmation = async (email) => {
  console.log({ email });
  await randomTimeout(); // Simulates email service API call
};

/**
 * Main order processing function (now ASYNC)
 *
 * KEY POINT: All operations are awaited, ensuring sequential execution
 * Each await pauses execution until the async operation completes
 *
 * @param {Object} order - Order details
 * @param {Object} state - Shared inventory state
 */
const buy = async (order, state) => {
  const available = await checkAvailability(order.items, state); // Wait for check
  if (available) {
    await processPayment(order.paymentDetails);        // Wait for payment
    await shipGoods(order.items, state);               // Wait for shipping
    await sendOrderConfirmation(order.userEmail);      // Wait for email
  }
  console.log({ state });
};

/**
 * Main function orchestrating all orders
 *
 * CRITICAL: Orders are processed sequentially because of await
 * - await buy(order1) completes BEFORE order2 starts
 * - await buy(order2) completes BEFORE order3 starts
 * - No concurrent access to shared state
 *
 * This is SAFE but potentially SLOW (each order waits for previous to complete)
 */
const main = async () => {
  const id = '1722';
  const state = { [id]: 5 }; // Shared state
  const name = 'A4 Paper; 500 sheets; 75 Gsm';

  const order1 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 3 }],
    userEmail: 'customer@example.com',
  };
  await buy(order1, state); // BLOCKS until order1 completes
  // At this point: inventory = 2

  const order2 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 1 }],
    userEmail: 'customer@example.com',
  };
  await buy(order2, state); // BLOCKS until order2 completes
  // At this point: inventory = 1

  const order3 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 2 }],
    userEmail: 'customer@example.com',
  };
  await buy(order3, state); // BLOCKS until order3 completes
  // This will FAIL: inventory = 1, but needs 2
};

main();

/**
 * EXECUTION FLOW:
 *
 * Time 0ms:    order1 starts
 * Time 250ms:  order1 completes (inventory: 5 → 2)
 * Time 250ms:  order2 starts (sees inventory: 2)
 * Time 500ms:  order2 completes (inventory: 2 → 1)
 * Time 500ms:  order3 starts (sees inventory: 1)
 * Time 750ms:  order3 FAILS (needs 2, has 1)
 *
 * KEY TAKEAWAY:
 * With proper await, async code behaves like synchronous code.
 * Orders process one at a time, sequentially.
 *
 * LIMITATION:
 * What if we want concurrent processing but still maintain consistency?
 * What if orders arrive from different sources at the same time?
 *
 * NEXT FILE (3-unsafe.js): See what happens when we DON'T await properly...
 */
