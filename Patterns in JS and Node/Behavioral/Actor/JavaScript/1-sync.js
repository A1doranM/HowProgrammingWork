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
  // Iterate through all requested items
  for (const item of items) {
    const { id, quantity } = item;
    const count = state[id]; // Get current inventory count
    // If requested quantity exceeds or equals available count, order cannot be fulfilled
    if (quantity >= count) {
      console.log({ checkEnd: false });
      return false;
    }
  }
  console.log({ checkEnd: true });
  return true; // All items available
};

/**
 * Process payment for the order (synchronous simulation)
 * In real implementation, this would be an async call to payment gateway
 * @param {Object} payment - Payment details
 */
const processPayment = (payment) => {
  console.log({ payment });
  // Simulates payment processing
};

/**
 * Ship goods and update inventory
 * @param {Array} items - Items to ship
 * @param {Object} state - Inventory state to update (MUTATES state)
 */
const shipGoods = (items, state) => {
  // Deduct shipped quantities from inventory
  for (const { id, quantity } of items) {
    state[id] -= quantity; // Direct state mutation (safe because synchronous)
  }
  console.log({ ship: items });
};

/**
 * Send order confirmation email
 * @param {string} email - Customer email address
 */
const sendOrderConfirmation = (email) => {
  console.log({ email });
  // Simulates sending confirmation email
};

/**
 * Main order processing function - orchestrates the entire order workflow
 * @param {Object} order - Order details {items, paymentDetails, userEmail}
 * @param {Object} state - Shared inventory state
 *
 * IMPORTANT: This function is SAFE in synchronous context because:
 * - All operations execute sequentially
 * - No context switches during execution
 * - State mutations happen atomically from JavaScript's perspective
 */
const buy = (order, state) => {
  const available = checkAvailability(order.items, state);
  if (available) {
    processPayment(order.paymentDetails);
    shipGoods(order.items, state);      // Modifies shared state
    sendOrderConfirmation(order.userEmail);
  }
  console.log({ state }); // Log final state after processing
};

// Setup: Product ID and initial inventory
const id = '1722';
const state = { [id]: 5 }; // Start with 5 items in inventory
const name = 'A4 Paper; 500 sheets; 75 Gsm';

/**
 * Schedule three orders using setTimeout
 *
 * WHY THIS IS SAFE (even with setTimeout):
 * - All three orders have same delay (100ms)
 * - But JavaScript event loop processes them sequentially
 * - Each buy() call completes fully before next one starts
 * - Synchronous code ensures no interleaving
 *
 * Execution order:
 * 1. Order1: checks 5, uses 3, inventory = 2
 * 2. Order2: checks 2, uses 1, inventory = 1
 * 3. Order3: checks 1, FAILS (needs 2, only 1 available)
 */
setTimeout(() => {
  const order1 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 3 }],
    userEmail: 'customer@example.com',
  };
  buy(order1, state); // Executes completely before order2
}, 100);

setTimeout(() => {
  const order2 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 1 }],
    userEmail: 'customer@example.com',
  };
  buy(order2, state); // Executes completely before order3
}, 100);

setTimeout(() => {
  const order3 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 2 }],
    userEmail: 'customer@example.com',
  };
  buy(order3, state); // This will fail - only 1 item left, needs 2
}, 100);

/**
 * KEY TAKEAWAY:
 * This synchronous version is safe because JavaScript's single-threaded
 * execution model ensures each setTimeout callback completes before the
 * next one runs. There's no concurrency problem here.
 *
 * NEXT FILE (2-async.js): See what happens when we add async delays...
 */
