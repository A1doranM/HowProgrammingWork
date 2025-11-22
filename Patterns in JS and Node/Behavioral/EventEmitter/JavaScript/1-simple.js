'use strict';

/**
 * FILE PURPOSE: Basic EventEmitter Implementation (Prototype-based)
 *
 * This file demonstrates the fundamental EventEmitter pattern using
 * classic JavaScript prototypes. This is the FOUNDATION of Node.js
 * event-driven architecture.
 *
 * CORE CONCEPT:
 * EventEmitter is a pub/sub (publish-subscribe) pattern where:
 * - Publishers emit events (don't know who's listening)
 * - Subscribers register listeners (don't know who publishes)
 * - EventEmitter mediates between them
 *
 * PATTERN BENEFITS:
 * ✅ Loose coupling: Publishers/subscribers independent
 * ✅ One-to-many: One event, many listeners
 * ✅ Dynamic: Add/remove listeners at runtime
 * ✅ Extensible: Add new events without changing code
 *
 * THIS IS THE PATTERN THAT POWERS:
 * - Node.js HTTP server (server.on('request'))
 * - Streams (stream.on('data'))
 * - Process events (process.on('exit'))
 * - Custom application events
 *
 * MINIMAL IMPLEMENTATION:
 * Just 2 methods: on() and emit()
 * ~15 lines of actual code
 * Complete event system!
 */

/**
 * EventEmitter Constructor
 *
 * Creates an event emitter instance with empty events registry.
 * Uses constructor function (pre-ES6 class syntax).
 *
 * INTERNAL STATE:
 * this.events = {
 *   'event1': [listener1, listener2],
 *   'event2': [listener3],
 *   'event3': [listener4, listener5, listener6]
 * }
 *
 * STRUCTURE:
 * - Keys: Event names (strings)
 * - Values: Arrays of listener functions
 *
 * WHY ARRAYS?
 * - Multiple listeners per event
 * - Order matters (listeners called in registration order)
 * - Easy to iterate
 *
 * WHY PROTOTYPE PATTERN?
 * - Memory efficient (methods shared via prototype)
 * - All instances share same on() and emit() functions
 * - No duplication of methods
 */
const EventEmitter = function () {
  /**
   * Events registry
   *
   * Hash map (object) storing event listeners.
   * - Key: Event name (string)
   * - Value: Array of listener functions
   *
   * EXAMPLE AFTER REGISTRATION:
   * {
   *   'data': [fn1, fn2, fn3],
   *   'error': [fn4],
   *   'close': [fn5, fn6]
   * }
   */
  this.events = {}; // Hash of arrays of functions
};

/**
 * Subscribe to an event (Register listener)
 *
 * Adds a listener function to the specified event.
 * Multiple listeners can be registered for the same event.
 *
 * @param {string} name - Event name to listen to
 * @param {Function} fn - Listener function to call when event emitted
 *
 * BEHAVIOR:
 * - If event already has listeners: Append to existing array
 * - If event is new: Create new array with this listener
 *
 * EXECUTION FLOW:
 *
 * emitter.on('click', handler1)
 *   → events.click doesn't exist
 *   → events.click = [handler1]
 *
 * emitter.on('click', handler2)
 *   → events.click exists: [handler1]
 *   → events.click.push(handler2)
 *   → events.click = [handler1, handler2]
 *
 * LISTENER ORDER:
 * Listeners are called in registration order.
 * First registered, first called.
 *
 * MEMORY CONSIDERATION:
 * Each listener holds reference to function.
 * Must remove listeners to prevent memory leaks.
 */
EventEmitter.prototype.on = function (name, fn) {
  const event = this.events[name];  // Get existing listeners array
  
  if (event) {
    // Event exists: Add to existing array
    event.push(fn);
  } else {
    // New event: Create array with this listener
    this.events[name] = [fn];
  }
};

/**
 * Emit an event (Notify all listeners)
 *
 * Calls all registered listeners for the specified event.
 * Passes any provided arguments to each listener.
 *
 * @param {string} name - Event name to emit
 * @param {...any} data - Arguments to pass to listeners (spread operator)
 *
 * BEHAVIOR:
 * - If no listeners: Return immediately (no-op)
 * - If listeners exist: Call each with provided data
 * - Synchronous: Listeners execute immediately, in order
 *
 * EXECUTION FLOW:
 *
 * emitter.emit('data', { value: 42 }, 'extra')
 *   → Get listeners for 'data': [fn1, fn2]
 *   → Call fn1({ value: 42 }, 'extra')
 *   → Call fn2({ value: 42 }, 'extra')
 *   → All listeners complete
 *
 * SYNCHRONOUS EXECUTION:
 * Listeners are called synchronously in a loop.
 * emit() blocks until all listeners complete.
 *
 * ORDER GUARANTEE:
 * Listeners called in registration order (FIFO).
 *
 * ERROR HANDLING:
 * ⚠️ If any listener throws, it stops the loop!
 * Better implementations wrap in try/catch.
 *
 * NO RETURN VALUE:
 * emit() doesn't return listener results.
 * For return values, use async/await pattern.
 */
EventEmitter.prototype.emit = function (name, ...data) {
  const event = this.events[name];  // Get listener array
  
  // No listeners registered for this event - early return
  if (!event) return;
  
  /**
   * Call each listener with spread data
   *
   * LOOP EXECUTION:
   * for (const listener of [fn1, fn2, fn3]) {
   *   listener(...data)  // fn1(arg1, arg2, ...), fn2(arg1, arg2, ...)
   * }
   *
   * SPREAD OPERATOR (...data):
   * Passes multiple arguments to listener.
   *
   * Example:
   *   emit('event', a, b, c)
   *   → listener(a, b, c)  // NOT listener([a, b, c])
   *
   * SYNCHRONOUS BLOCKING:
   * Each listener must complete before next one is called.
   * If listener takes 1 second, emit() takes N seconds for N listeners.
   */
  for (const listener of event) {
    listener(...data);
  }
};

/**
 * Export for use in other modules
 *
 * CommonJS module export.
 * Usage: const EventEmitter = require('./1-simple.js');
 */
module.exports = EventEmitter;

/**
 * USAGE EXAMPLE (see 2-usage.js):
 *
 * const EventEmitter = require('./1-simple.js');
 * const ee = new EventEmitter();
 *
 * // Subscribe
 * ee.on('event1', (data) => {
 *   console.log('Received:', data);
 * });
 *
 * // Publish
 * ee.emit('event1', { a: 5 });
 * // Output: Received: { a: 5 }
 */

/**
 * MINIMAL BUT COMPLETE:
 *
 * This 19-line implementation is a COMPLETE event system!
 *
 * FEATURES:
 * ✅ Multiple listeners per event
 * ✅ Multiple arguments to listeners
 * ✅ Any data type as event data
 * ✅ Dynamic event registration
 * ✅ Prototype-based (memory efficient)
 *
 * LIMITATIONS:
 * ❌ No once() (one-time listeners)
 * ❌ No remove() (can't unsubscribe)
 * ❌ No error handling
 * ❌ No max listeners warning
 * ❌ No wildcard events
 * ❌ No async support
 *
 * NEXT FILES ADD THESE FEATURES:
 * - 3-enhanced.js: Wildcard support
 * - 4-star-fix.js: Fix wildcard infinite loop
 * - 6-closure.js: Privacy via closures
 * - 8-methods.js: Full API (once, remove, clear, etc.)
 * - b-class.js: ES6 class + Map/Set
 * - c-async.js: Async listener support
 */

/**
 * WHY THIS PATTERN IS POWERFUL:
 *
 * 1. DECOUPLING:
 *    Emitter doesn't know listeners.
 *    Listeners don't know emitter's internal logic.
 *
 * 2. EXTENSIBILITY:
 *    Add new listeners without changing emitter:
 *      ee.on('event', newListener);
 *
 * 3. REUSABILITY:
 *    Same listener for multiple events:
 *      ee.on('save', logger);
 *      ee.on('update', logger);
 *      ee.on('delete', logger);
 *
 * 4. TESTABILITY:
 *    Easy to test in isolation:
 *      const mock = jest.fn();
 *      ee.on('event', mock);
 *      ee.emit('event');
 *      expect(mock).toHaveBeenCalled();
 */

/**
 * REAL-WORLD ANALOGY:
 *
 * EventEmitter is like a radio station:
 * - Station broadcasts (emit)
 * - Listeners tune in (on)
 * - Station doesn't know how many listeners
 * - Listeners don't know station's internal workings
 * - Multiple listeners can tune to same frequency
 * - Listeners can tune in/out anytime
 *
 * Just replace "tune in" with on() and "broadcast" with emit()!
 */

/**
 * PATTERN ESSENCE:
 *
 * The essence of EventEmitter is:
 * 1. Store listener functions in arrays keyed by event name
 * 2. on(): Add function to array
 * 3. emit(): Call all functions in array
 *
 * That's it! Everything else is enhancement.
 *
 * This simple pattern is the foundation of:
 * - Entire Node.js ecosystem
 * - DOM events in browsers
 * - React's event system
 * - Vue's event bus
 * - Many other frameworks
 *
 * Understanding these 19 lines means understanding how
 * event-driven programming works in JavaScript!
 */
