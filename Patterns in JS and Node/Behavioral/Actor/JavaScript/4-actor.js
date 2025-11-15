'use strict';

/**
 * FILE PURPOSE: Actor Pattern Solution - Eliminates race conditions
 *
 * ✅ THIS CODE IS SAFE! ✅
 *
 * This file solves the race condition from 3-unsafe.js by introducing
 * the Actor pattern. Key improvements:
 *
 * 1. Messages are queued instead of processed immediately
 * 2. Messages are processed sequentially (one at a time)
 * 3. State is encapsulated within the actor (no direct external access)
 * 4. Concurrent message arrival is handled safely
 *
 * COMPARISON:
 * - 2-async.js: Safe but requires manual awaiting (sequential calls)
 * - 3-unsafe.js: Unsafe concurrent calls with race conditions
 * - 4-actor.js (this file): Safe concurrent calls via message queuing
 */

const timers = require('node:timers/promises');
const randomTimeout = () => timers.setTimeout(Math.random() * 500);

/**
 * Actor class - Implements the Actor Pattern
 *
 * CORE CONCEPT:
 * - Encapsulates state and behavior
 * - Processes messages sequentially from a queue
 * - Prevents concurrent state access through serialization
 *
 * ARCHITECTURE:
 *   External → send(msg) → [Queue] → process() → behavior(msg, state)
 *                            ↓
 *                      [msg1, msg2, msg3]
 *                            ↓
 *                     Sequential execution
 */
class Actor {
  // Private fields (ES2022) - truly encapsulated, no external access
  #queue = [];          // Message queue (FIFO)
  #processing = false;  // Flag to prevent concurrent processing
  #behavior = null;     // Function that processes each message
  #state = null;        // Actor's internal state (encapsulated)

  /**
   * Initialize actor with behavior and initial state
   * @param {Function} behavior - async function(message, state) that processes messages
   * @param {Object} state - initial state object
   */
  constructor(behavior, state) {
    this.#behavior = behavior;
    this.#state = state;
  }

  /**
   * Send a message to the actor (public interface)
   *
   * Messages are queued and processed asynchronously.
   * Multiple send() calls from different sources are safe.
   *
   * @param {any} message - the message to process
   * @returns {Promise} - resolves when message is queued (not necessarily processed)
   */
  async send(message) {
    this.#queue.push(message);  // Add message to queue
    await this.#process();       // Trigger processing (if not already processing)
  }

  /**
   * Process queued messages sequentially (private method)
   *
   * CRITICAL LOGIC:
   * 1. Check if already processing (if yes, return immediately)
   * 2. Set processing flag to true (acquire "lock")
   * 3. Process ALL queued messages one by one
   * 4. Set processing flag to false (release "lock")
   *
   * This ensures:
   * - Only one message is processed at a time
   * - Messages are processed in order (FIFO)
   * - Concurrent send() calls safely add to queue without interfering
   *
   * EXECUTION FLOW:
   *   send(msg1) → #process() starts, processing=true
   *   send(msg2) → #process() returns (already processing)
   *   send(msg3) → #process() returns (already processing)
   *   ... msg1 completes ...
   *   ... msg2 processes ...
   *   ... msg3 processes ...
   *   processing=false
   */
  async #process() {
    // If already processing, return immediately (prevents concurrent execution)
    if (this.#processing) return;
    
    // Acquire processing "lock"
    this.#processing = true;

    // Process all messages in queue sequentially
    while (this.#queue.length) {
      const message = this.#queue.shift();  // Get next message (FIFO)
      // Process message with actor's behavior and state
      await this.#behavior(message, this.#state);
      // Only after this completes, next message is processed
    }

    // Release processing "lock"
    this.#processing = false;
  }
}

// ===========================
// Usage Example: Order Processing
// ===========================

/**
 * Check availability - same as before, but now called within Actor context
 * State is protected by Actor's sequential processing
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
  await randomTimeout();
  return true;
};

/**
 * Process payment - async operation
 */
const processPayment = async (payment) => {
  console.log({ payment });
  await randomTimeout();
};

/**
 * Ship goods and update inventory
 *
 * SAFE NOW: Even though this modifies state, Actor ensures
 * only one message processes at a time, so no concurrent modifications
 */
const shipGoods = async (items, state) => {
  for (const { id, quantity } of items) {
    state[id] -= quantity;  // ✅ SAFE: Sequential execution guaranteed
  }
  await randomTimeout();
  console.log({ ship: items });
};

/**
 * Send confirmation email
 */
const sendOrderConfirmation = async (email) => {
  console.log({ email });
  await randomTimeout();
};

/**
 * Behavior function: Process a complete order
 * This is the "behavior" passed to the Actor
 *
 * The Actor guarantees:
 * - This function completes fully before next message is processed
 * - State is only accessed by one execution of this function at a time
 * - No race conditions possible
 *
 * @param {Object} order - The message (order details)
 * @param {Object} state - Actor's state (inventory)
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

// ===========================
// Actor Initialization
// ===========================

const id = '1722';
// Create an actor with buy behavior and initial inventory state
const orderActor = new Actor(buy, { [id]: 5 });
const name = 'A4 Paper; 500 sheets; 75 Gsm';

/**
 * ✅ THE SOLUTION IN ACTION ✅
 *
 * Unlike 3-unsafe.js, we send messages to the Actor instead of calling buy() directly.
 * All three setTimeout callbacks fire at ~same time (10ms), but:
 *
 * 1. order1.send() → adds to queue, starts processing
 * 2. order2.send() → adds to queue, processing already started (returns)
 * 3. order3.send() → adds to queue, processing already started (returns)
 *
 * Actor processes them sequentially:
 * - Queue: [order1, order2, order3]
 * - Process order1 completely (inventory: 5 → 2)
 * - Process order2 completely (inventory: 2 → 1)
 * - Process order3 (FAILS, needs 2, has 1)
 */
setTimeout(() => {
  const order1 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 3 }],
    userEmail: 'customer@example.com',
  };
  orderActor.send(order1);  // Message 1: Queued and starts processing
}, 10);

setTimeout(() => {
  const order2 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 1 }],
    userEmail: 'customer@example.com',
  };
  orderActor.send(order2);  // Message 2: Queued (will process after order1)
}, 10);

setTimeout(() => {
  const order3 = {
    paymentDetails: { card: '**** **** **** 1234' },
    items: [{ id, name, price: 52, quantity: 2 }],
    userEmail: 'customer@example.com',
  };
  orderActor.send(order3);  // Message 3: Queued (will process after order2)
}, 10);

/**
 * GUARANTEED EXECUTION ORDER:
 *
 * Time 10ms:    All three send() calls execute
 *               Queue becomes: [order1, order2, order3]
 *               Actor starts processing order1
 *
 * Time 10-510ms: order1 processes (random delays in operations)
 *               Actor.#processing = true (blocks new processing)
 *               order2 and order3 wait in queue
 *
 * Time ~260ms:  order1 completes
 *               Inventory: 5 → 2
 *               Actor processes order2 from queue
 *
 * Time ~510ms:  order2 completes
 *               Inventory: 2 → 1
 *               Actor processes order3 from queue
 *
 * Time ~760ms:  order3 checks inventory
 *               Sees: inventory = 1
 *               Needs: 2
 *               FAILS (as expected)
 *
 * BENEFITS DEMONSTRATED:
 *
 * ✅ No race conditions: Sequential processing prevents concurrent state access
 * ✅ Correct behavior: Orders process in FIFO order with accurate inventory
 * ✅ Concurrent messages: Multiple send() calls are safe (queued, not conflicting)
 * ✅ State protection: Inventory state is only accessed by one operation at a time
 * ✅ Predictable results: Same outcome every time, regardless of timing
 *
 * COMPARISON TO OTHER FILES:
 *
 * 1-sync.js:    Safe but synchronous (no real-world async operations)
 * 2-async.js:   Safe but requires manual await (caller must serialize)
 * 3-unsafe.js:  UNSAFE - race condition with concurrent calls
 * 4-actor.js:   SAFE - handles concurrent calls automatically via Actor
 *
 * KEY TAKEAWAY:
 * Actor pattern provides the safety of 2-async.js (sequential processing)
 * with the convenience of 3-unsafe.js (concurrent message sending).
 *
 * The pattern shifts responsibility for serialization from the caller
 * (who must remember to await) to the Actor (which enforces it automatically).
 */
