'use strict';

/**
 * FILE PURPOSE: Async Emit Wrapper for EventEmitter
 *
 * This file demonstrates creating an async emit() wrapper that waits for
 * all listeners to complete before continuing.
 *
 * THE PROBLEM:
 * EventEmitter's emit() is synchronous - doesn't wait for async listeners:
 *
 * emitter.on('save', async (data) => {
 *   await database.save(data);  // Async operation
 * });
 *
 * emitter.emit('save', data);
 * console.log('Done');  // Prints BEFORE database.save completes!
 *
 * THE SOLUTION:
 * Create async emit wrapper that:
 * 1. Gets all listeners
 * 2. Calls them all (returns Promises)
 * 3. Waits for all Promises via Promise.all()
 * 4. Returns when all complete
 *
 * PATTERN: Wrapper Pattern + Promise.all
 * Wraps existing API to add async coordination.
 *
 * USE CASES:
 * - Wait for all async handlers to complete
 * - Coordinate multiple async operations
 * - Ensure cleanup happens after all handlers
 * - Collect results from all handlers
 *
 * ALTERNATIVE:
 * Use AsyncEmitter from ../EventEmitter/c-async.js
 * which has async emit() built-in.
 */

const EventEmitter = require('node:events');

/**
 * Import setTimeout from promises API
 *
 * node:timers/promises provides Promise-based timer functions.
 *
 * setTimeout(ms) returns Promise that resolves after ms.
 * Equivalent to: new Promise(resolve => setTimeout(resolve, ms))
 *
 * USAGE:
 * await setTimeout(1000);  // Sleep for 1 second
 */
const { setTimeout } = require('node:timers/promises');

/**
 * Async emit wrapper function
 *
 * Wraps EventEmitter's emit() to wait for async listeners.
 *
 * @param {EventEmitter} ee - EventEmitter instance
 * @param {string} name - Event name to emit
 * @param {...any} args - Arguments to pass to listeners
 * @returns {Promise<any[]>} - Promise that resolves when all listeners complete
 *
 * IMPLEMENTATION BREAKDOWN:
 *
 * 1. GET LISTENERS:
 *    ee.listeners(name)
 *    Returns array of all listener functions for event.
 *
 *    Example:
 *    listeners = [asyncHandler1, asyncHandler2]
 *
 * 2. CALL ALL LISTENERS:
 *    listeners.map(f => f(...args))
 *    Calls each listener with provided arguments.
 *
 *    Each call returns:
 *    - Promise (if listener is async)
 *    - Value (if listener is sync)
 *
 *    Result:
 *    promises = [Promise1, Promise2] or [value1, Promise1]
 *
 * 3. WAIT FOR ALL:
 *    await Promise.all(promises)
 *    Waits for all Promises to resolve.
 *
 *    - If all listeners are async: Waits for all
 *    - If some are sync: Wraps values in resolved Promises
 *    - Returns array of results: [result1, result2]
 *
 * EXECUTION PATTERN:
 *
 * await emit(ee, 'save', data)
 *   ↓
 * 1. Get all 'save' listeners: [handler1, handler2]
 * 2. Call handler1(data) → returns Promise1
 * 3. Call handler2(data) → returns Promise2
 * 4. promises = [Promise1, Promise2]
 * 5. await Promise.all([Promise1, Promise2])
 *   ↓ (waiting for both...)
 * 6. Both Promises resolve
 * 7. Return [result1, result2]
 *   ↓
 * Both handlers completed
 *
 * PARALLEL EXECUTION:
 * All listeners start simultaneously (not sequential).
 * Promise.all waits for ALL to complete.
 *
 * ERROR HANDLING:
 * If any listener throws/rejects, Promise.all rejects.
 * Can use try/catch:
 *   try {
 *     await emit(ee, 'event', data);
 *   } catch (err) {
 *     console.error('Handler failed:', err);
 *   }
 */
const emit = async (ee, name, ...args) => {
  const listeners = ee.listeners(name);  // Get all listeners
  const promises = listeners.map((f) => f(...args));  // Call all
  return await Promise.all(promises);  // Wait for all
};

/**
 * Main async function demonstrating async emit
 */
const main = async () => {
  /**
   * Create EventEmitter
   */
  const ee = new EventEmitter();
  
  /**
   * Register async listener
   *
   * ASYNC LISTENER:
   * Listener function is async, uses await inside.
   * Returns Promise that resolves after 1 second.
   *
   * LISTENER BEHAVIOR:
   * 1. Log "Enter"
   * 2. Wait 1 second (await setTimeout)
   * 3. Log "Exit"
   * 4. Return (Promise resolves)
   *
   * WITH NORMAL emit():
   *   ee.emit('name', data);
   *   console.log('Done');  // Prints IMMEDIATELY (before "Exit")
   *
   * WITH ASYNC emit():
   *   await emit(ee, 'name', data);
   *   console.log('Done');  // Prints AFTER "Exit" (waits 1s)
   */
  ee.on('name', async (data) => {
    console.log('Enter event: name', data);
    await setTimeout(1000);  // Simulate async work (1 second delay)
    console.log('Exit event: name');
  });
  
  /**
   * Emit using async wrapper
   *
   * WAITS for listener to complete before continuing.
   *
   * EXECUTION TIMELINE:
   *
   * Time 0ms:    await emit(ee, 'name', { value: 1 })
   *              ↓
   *              Listener called: console.log('Enter...')
   *              ↓
   *              await setTimeout(1000) starts
   *              ↓
   * Time 0-1000ms: Waiting for setTimeout Promise
   *              ↓
   * Time 1000ms: setTimeout resolves
   *              ↓
   *              console.log('Exit...')
   *              ↓
   *              Listener Promise resolves
   *              ↓
   *              Promise.all resolves
   *              ↓
   *              emit() returns
   *              ↓
   *              await returns
   *              ↓
   *              console.log('Done')
   *
   * TOTAL TIME: ~1 second
   *
   * OUTPUT ORDER:
   * Enter event: name { value: 1 }
   * Exit event: name               ← After 1 second
   * Done                            ← After listener completes
   */
  await emit(ee, 'name', { value: 1 });
  
  /**
   * Log completion
   *
   * This prints AFTER listener completes (including its async operations).
   *
   * COMPARISON:
   *
   * Without await:
   *   ee.emit('name', { value: 1 });
   *   console.log('Done');
   *   Output:
   *     Enter event: name { value: 1 }
   *     Done                           ← BEFORE listener completes!
   *     Exit event: name               ← 1 second later
   *
   * With await:
   *   await emit(ee, 'name', { value: 1 });
   *   console.log('Done');
   *   Output:
   *     Enter event: name { value: 1 }
   *     Exit event: name               ← After 1 second
   *     Done                           ← AFTER listener completes!
   *
   * This is the KEY DIFFERENCE async emit provides!
   */
  console.log('Done');
};

/**
 * Execute main function
 */
main();

/**
 * WHY THIS PATTERN IS USEFUL:
 *
 * 1. COORDINATION:
 *    Ensure all event handlers complete before continuing.
 *    Critical for cleanup, shutdown, etc.
 *
 * 2. ERROR PROPAGATION:
 *    Errors in handlers propagate to caller:
 *    try {
 *      await emit(ee, 'save', data);
 *    } catch (err) {
 *      console.error('Save failed:', err);
 *    }
 *
 * 3. RESULT COLLECTION:
 *    const results = await emit(ee, 'process', data);
 *    // results = array of all handler return values
 *
 * 4. SEQUENTIAL OPERATIONS:
 *    await emit(ee, 'validate', data);  // Wait for validation
 *    await emit(ee, 'save', data);      // Then save
 *    await emit(ee, 'notify', data);    // Then notify
 *
 * 5. PARALLEL OPERATIONS:
 *    await Promise.all([
 *      emit(ee, 'task1', data),
 *      emit(ee, 'task2', data),
 *      emit(ee, 'task3', data)
 *    ]);
 *    // All three events processed in parallel
 */

/**
 * ALTERNATIVE APPROACHES:
 *
 * 1. CUSTOM ASYNC EVENTEMITTER:
 *    See ../EventEmitter/c-async.js for built-in async emit
 *
 * 2. LISTENER-BASED COORDINATION:
 *    let completed = 0;
 *    const total = ee.listenerCount('event');
 *
 *    ee.on('event', async (data) => {
 *      await process(data);
 *      if (++completed === total) {
 *        ee.emit('all-complete');
 *      }
 *    });
 *
 * 3. PROMISE AGGREGATION:
 *    const promises = [];
 *    ee.on('event', async (data) => {
 *      const promise = process(data);
 *      promises.push(promise);
 *    });
 *    ee.emit('event', data);
 *    await Promise.all(promises);
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. ASYNC EMIT: Wraps emit to wait for async listeners
 * 2. PROMISE.ALL: Waits for all listeners in parallel
 * 3. COORDINATION: Ensures completion before continuing
 * 4. SIMPLE WRAPPER: Just 3 lines of implementation
 * 5. POWERFUL PATTERN: Transforms sync to async behavior
 *
 * COMPARISON:
 * - Standard emit(): Fire and forget (doesn't wait)
 * - Async emit (this): Fire and wait (coordinates completion)
 *
 * This pattern is essential for async event-driven architectures
 * where you need to ensure all handlers complete before proceeding!
 */
