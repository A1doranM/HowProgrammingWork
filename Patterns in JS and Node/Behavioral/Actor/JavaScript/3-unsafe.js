'use strict';

/**
 * FILE PURPOSE: ANTI-PATTERN - Race condition demonstration (UNSAFE)
 *
 * ⚠️ THIS CODE HAS A RACE CONDITION! ⚠️
 *
 * This file shows what happens when async operations access shared state
 * WITHOUT proper synchronization. The same async code as 2-async.js, but:
 *
 * KEY DIFFERENCE from 2-async.js:
 * - Orders are NOT awaited before launching next order (line 60, 69, 78)
 * - All three setTimeout callbacks fire at ~same time (10ms delay)
 * - All three buy() operations run CONCURRENTLY
 * - They all check inventory before any of them update it
 *
 * RESULT: Race condition → overselling inventory
 *
 * This demonstrates the PROBLEM that Actor pattern solves.
 */

const timers = require('node:timers/promises');

/**
 * Random delay to simulate realistic async operations
 * The randomness makes the race condition more apparent
 */
const randomTimeout = () => timers.setTimeout(Math.random() * 500);

/**
 * Check availability with async delay at the START
 *
 * CRITICAL RACE CONDITION POINT:
 * The await at the START means all three orders will:
 * 1. Wait a random time (0-500ms)
 * 2. Then ALL check inventory at approximately the same time
 * 3. ALL see the same initial inventory value (5)
 * 4. ALL pass the availability check
 * 5. ALL proceed to ship, causing overselling
 */
const checkAvailability = async (items, state) => {
  await randomTimeout(); // ⚠️ CRITICAL: Delay BEFORE check creates race window
  console.log({ checkStart: items });
  for (const item of items) {
    const { id, quantity } = item;
    const count = state[id]; // Multiple orders read SAME value concurrently
    if (quantity >= count) {
      console.log({ checkEnd: false });
      return false;
    }
  }
  console.log({ checkEnd: true });
  return true;
};

/**
 * Process payment with delay
 */
const processPayment = async (payment) => {
  await randomTimeout();
  console.log({ payment });
};

/**
 * Ship goods and update inventory
 *
 * RACE CONDITION MANIFESTS HERE:
 * Multiple concurrent executions of this function will all decrement
 * state[id] around the same time, but each read-modify-write is not atomic.
 *
 * Example with 3 concurrent orders (qty 3, 1, 2):
 * - Order1 reads: state[id] = 5, subtracts 3, writes 2
 * - Order2 reads: state[id] = 5, subtracts 1, writes 4 (WRONG! Should be 1)
 * - Order3 reads: state[id] = 5, subtracts 2, writes 3 (WRONG! Should be -1 or error)
 * Final state depends on timing - might be 2, 3, or 4 (all WRONG!)
 */
const shipGoods = async (items, state) => {
  await randomTimeout();
  for (const { id, quantity } of items) {
    // ⚠️ NON-ATOMIC: read-modify-write with concurrent access
    state[id] -= quantity; // Multiple orders modify this concurrently!
  }
  console.log({ ship: items });
};

/**
 * Send confirmation email
 */
const sendOrderConfirmation = async (email) => {
  await randomTimeout();
  console.log({ email });
};

/**
 * Buy function - same as 2-async.js
 * The problem isn't in this function - it's in how it's called (without await)
 */
const buy = async (order, state) => {
  const available = await checkAvailability(order.items, state);
  if (available) {
    await processPayment(order.paymentDetails);
    await shipGoods(order.items, state);
    await sendOrderConfirmation(order.userEmail);
  }
  console.log({ state });
};

// Shared state - all orders access this concurrently
const id = '1722';
const state = { [id]: 5 }; // Start with 5 items
const name = 'A4 Paper; 500 sheets; 75 Gsm';

/**
 * ⚠️ THE RACE CONDITION IS TRIGGERED HERE ⚠️
 *
 * All three setTimeout callbacks fire at ~10ms (same time)
 * buy() is called without await, so all three run CONCURRENTLY
 */
setTimeout(() => {
  const order1 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 3 }],
    userEmail: 'customer@example.com',
  };
  buy(order1, state); // ⚠️ NO AWAIT! Fires and continues immediately
}, 10);

setTimeout(() => {
  const order2 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 1 }],
    userEmail: 'customer@example.com',
  };
  buy(order2, state); // ⚠️ NO AWAIT! Runs concurrently with order1
}, 10);

setTimeout(() => {
  const order3 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 2 }],
    userEmail: 'customer@example.com',
  };
  buy(order3, state); // ⚠️ NO AWAIT! Runs concurrently with order1 & order2
}, 10);

/**
 * RACE CONDITION TIMELINE:
 *
 * Time 10ms:  All three setTimeout callbacks fire
 *             - buy(order1) starts
 *             - buy(order2) starts
 *             - buy(order3) starts
 *
 * Time 10-510ms: All three wait in checkAvailability (random delays)
 *
 * Time ~260ms (avg): All three complete checkAvailability
 *             - order1 checks: sees inventory = 5 ✓ PASS
 *             - order2 checks: sees inventory = 5 ✓ PASS (WRONG! Should see 2)
 *             - order3 checks: sees inventory = 5 ✓ PASS (WRONG! Should see 1)
 *
 * Time ~510ms: All three start shipGoods
 *             - order1: state[id] = 5 - 3 = 2
 *             - order2: state[id] = 5 - 1 = 4 (reads stale value!)
 *             - order3: state[id] = 5 - 2 = 3 (reads stale value!)
 *             Final state[id] = 2, 3, or 4 (depends on timing, all WRONG!)
 *
 * EXPECTED: inventory should be 5 - 3 = 2, then order2 uses 1 → 1, order3 FAILS
 * ACTUAL:   All three orders succeed, final inventory is unpredictable
 *
 * CONSEQUENCES:
 * - Overselling inventory (selling more than available)
 * - Financial loss (shipping items you don't have)
 * - Customer dissatisfaction (orders that can't be fulfilled)
 * - Data inconsistency (inventory doesn't match reality)
 *
 * THE SOLUTION: Actor Pattern (see 4-actor.js)
 * Actor ensures sequential processing even with concurrent message arrival
 */
