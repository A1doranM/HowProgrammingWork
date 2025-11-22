'use strict';

/**
 * FILE PURPOSE: Usage Example of Basic EventEmitter
 *
 * This file demonstrates how to use the EventEmitter from 1-simple.js.
 * Shows the basic pub/sub workflow:
 * 1. Create emitter instance
 * 2. Register listener(s)
 * 3. Emit event
 *
 * This is the SIMPLEST possible usage of EventEmitter.
 */

/**
 * Import EventEmitter from 1-simple.js
 *
 * CommonJS require - gets the EventEmitter constructor function
 */
const EventEmitter = require('./1-simple.js');

/**
 * Create EventEmitter instance
 *
 * INITIALIZATION:
 * ee = {
 *   events: {}  // Empty events registry
 * }
 *
 * The 'new' keyword:
 * 1. Creates empty object
 * 2. Sets prototype to EventEmitter.prototype
 * 3. Calls EventEmitter constructor with this
 * 4. Returns the object
 *
 * RESULT:
 * ee now has on() and emit() methods via prototype
 */
const ee = new EventEmitter();

/**
 * Register a listener for 'event1'
 *
 * SUBSCRIPTION:
 * When 'event1' is emitted, this function will be called.
 *
 * LISTENER FUNCTION:
 * @param {any} data - Data passed when event is emitted
 *
 * PURPOSE:
 * Logs the received data to console.
 *
 * AFTER REGISTRATION:
 * ee.events = {
 *   'event1': [
 *     (data) => { console.dir(data); }
 *   ]
 * }
 *
 * PATTERN NOTE:
 * Listener doesn't know:
 * - When event will be emitted
 * - Who will emit it
 * - What other listeners exist
 *
 * This is LOOSE COUPLING in action!
 */
ee.on('event1', (data) => {
  console.dir(data);
});

/**
 * Emit 'event1' with data
 *
 * PUBLICATION:
 * Notify all listeners registered for 'event1'.
 *
 * EXECUTION FLOW:
 *
 * ee.emit('event1', { a: 5 })
 *   → Get listeners for 'event1': [(data) => console.dir(data)]
 *   → Call listener({ a: 5 })
 *   → console.dir({ a: 5 })
 *   → Output: { a: 5 }
 *
 * DATA PASSING:
 * The object { a: 5 } is passed to the listener as 'data' parameter.
 * Can pass multiple arguments:
 *   emit('event', arg1, arg2, arg3)
 *   → listener(arg1, arg2, arg3)
 *
 * SYNCHRONOUS EXECUTION:
 * emit() blocks until listener completes.
 * For async, see c-async.js.
 */
ee.emit('event1', { a: 5 });

/**
 * EXPECTED OUTPUT:
 *
 * { a: 5 }
 *
 * FLOW SUMMARY:
 *
 * 1. Create EventEmitter instance
 * 2. Register listener for 'event1'
 * 3. Emit 'event1' with data { a: 5 }
 * 4. Listener is called with { a: 5 }
 * 5. Listener logs data to console
 */

/**
 * PATTERN DEMONSTRATION:
 *
 * This simple example shows the core EventEmitter pattern:
 *
 * DECOUPLING:
 * - Emitter (ee.emit) doesn't know about listener
 * - Listener doesn't know about emitter's internals
 * - Connected only through event name ('event1')
 *
 * ONE-TO-MANY:
 * - Could add more listeners:
 *     ee.on('event1', listener2);
 *     ee.on('event1', listener3);
 * - All would be notified on emit
 *
 * FLEXIBILITY:
 * - Listeners can be added at any time
 * - Events can be emitted any number of times
 * - Each emit notifies current listeners
 */

/**
 * EXTENDING THE EXAMPLE:
 *
 * Multiple listeners:
 *   ee.on('event1', (data) => console.log('First:', data));
 *   ee.on('event1', (data) => console.log('Second:', data));
 *   ee.emit('event1', { a: 5 });
 *   // Output:
 *   // First: { a: 5 }
 *   // Second: { a: 5 }
 *
 * Multiple events:
 *   ee.on('save', () => console.log('Saved'));
 *   ee.on('update', () => console.log('Updated'));
 *   ee.emit('save');    // Output: Saved
 *   ee.emit('update');  // Output: Updated
 *
 * Multiple arguments:
 *   ee.on('data', (a, b, c) => console.log(a, b, c));
 *   ee.emit('data', 1, 2, 3);  // Output: 1 2 3
 */

/**
 * REAL-WORLD ANALOGY:
 *
 * Imagine a news channel (EventEmitter):
 * - Viewers subscribe to channel (ee.on)
 * - Channel broadcasts news (ee.emit)
 * - All subscribers receive broadcast
 * - Channel doesn't know who's watching
 * - Viewers don't know channel's equipment
 *
 * This is exactly how EventEmitter works!
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. SIMPLE API: Just on() and emit()
 * 2. LOOSE COUPLING: Publisher/subscribers independent
 * 3. ONE-TO-MANY: One emit, many listeners called
 * 4. DYNAMIC: Add listeners anytime
 * 5. SYNCHRONOUS: Listeners execute in order
 * 6. FOUNDATION: This pattern powers Node.js
 *
 * NEXT FILES:
 * - 3-enhanced.js: Add wildcard support
 * - 6-closure.js: Use closures for privacy
 * - 8-methods.js: Full-featured API
 * - b-class.js: Modern ES6 class
 * - c-async.js: Async listener support
 */
