'use strict';

/**
 * FILE PURPOSE: Compare Error Event Handling
 *
 * This file demonstrates a CRITICAL DIFFERENCE in how EventTarget and
 * EventEmitter handle 'error' events.
 *
 * CRITICAL DIFFERENCE:
 * - EventEmitter: 'error' is SPECIAL - crashes if no listener!
 * - EventTarget: 'error' is REGULAR - just another event
 *
 * ⚠️ EVENTEMITTER DANGER:
 * If you emit('error') without an 'error' listener,
 * Node.js will throw an uncaught exception and CRASH the process!
 *
 * BEST PRACTICE:
 * ALWAYS register an 'error' listener on EventEmitters:
 *   emitter.on('error', (err) => handleError(err));
 *
 * This is a common source of production crashes in Node.js!
 */

const { EventEmitter } = require('node:events');

// ===========================
// Part 1: EventEmitter - Special Error Handling
// ===========================

/**
 * Create EventEmitter instance
 */
const emitter = new EventEmitter();

/**
 * Register 'error' event listener
 *
 * ⚠️ CRITICAL: Always handle 'error' events!
 *
 * If this listener wasn't registered:
 *   emitter.emit('error', new Error(...))
 *   → No 'error' listener
 *   → Node.js throws the error
 *   → Uncaught exception
 *   → PROCESS CRASHES!
 *
 * This is UNIQUE to the 'error' event name.
 * Other events without listeners just do nothing.
 *
 * WHY THIS BEHAVIOR?
 * Errors should NEVER be silently ignored.
 * If you emit an error, you MUST handle it.
 * This design prevents silent failures.
 *
 * BEST PRACTICE:
 * Add error listener immediately after creating emitter:
 *
 * const emitter = new EventEmitter();
 * emitter.on('error', (err) => {
 *   console.error('Error:', err);
 *   // Handle error appropriately
 * });
 */
emitter.on('error', (data) => {
  console.dir({ data });
  // Error is HANDLED - process won't crash
});

/**
 * Emit 'error' event with Error object
 *
 * SAFE: Because we registered an 'error' listener above.
 *
 * EXECUTION:
 * emitter.emit('error', new Error('Something went wrong'))
 *   ↓
 * 1. Get 'error' listeners: [listener]
 * 2. Call listener(Error('Something went wrong'))
 *    ↓
 *    console.dir({ data: Error(...) })
 * 3. Error is handled (process continues)
 *
 * OUTPUT:
 * {
 *   data: Error: Something went wrong
 *     at Object.<anonymous> ...
 *     // stack trace
 * }
 *
 * WHAT IF NO LISTENER?
 *
 * // emitter.on('error', ...) ← commented out
 * emitter.emit('error', new Error('Oops'));
 *   ↓
 * 1. Get 'error' listeners: []  (empty!)
 * 2. Special 'error' check: No listeners for 'error'!
 * 3. throw err  // Re-throw as uncaught exception
 *   ↓
 * Uncaught Error: Oops
 *   at Object.<anonymous> ...
 *   ↓
 * PROCESS EXITS with non-zero code
 *
 * This is a COMMON BUG in Node.js applications!
 */
emitter.emit('error', new Error('Something went wrong'));

// ===========================
// Part 2: EventTarget - Regular Error Handling
// ===========================

/**
 * Create EventTarget instance
 */
const target = new EventTarget();

/**
 * Create 'error' event (just a regular event)
 *
 * NO SPECIAL HANDLING:
 * 'error' is treated like any other event in EventTarget.
 * Won't crash if no listener registered.
 *
 * EVENT OBJECT:
 * CustomEvent with Error in detail property.
 */
const event = new CustomEvent('error', {
  detail: new Error('Something went wrong'),
});

/**
 * Dispatch 'error' event WITHOUT listener
 *
 * EVENTTARGET BEHAVIOR:
 * No listener registered for 'error', but that's OK!
 *
 * EXECUTION:
 * target.dispatchEvent(event)
 *   ↓
 * 1. Get listeners for 'error': []  (empty)
 * 2. Loop over listeners (none)
 * 3. Return true
 *   ↓
 * NOTHING HAPPENS - process continues normally
 *
 * NO CRASH:
 * Unlike EventEmitter, EventTarget doesn't have special
 * handling for 'error' events. It's just a regular event.
 *
 * COMPARISON:
 *
 * EventEmitter without 'error' listener:
 *   emitter.emit('error', err)  → CRASHES!
 *
 * EventTarget without 'error' listener:
 *   target.dispatchEvent(errorEvent)  → Does nothing (safe)
 *
 * IMPLICATION:
 * EventTarget is "safer" in this regard - won't crash.
 * But errors might be silently ignored (also bad!).
 *
 * BEST PRACTICE:
 * Still register error listeners even with EventTarget
 * to handle errors appropriately.
 */
target.dispatchEvent(event);

/**
 * Hold process open for demonstration
 *
 * setTimeout prevents process from exiting immediately.
 * Gives time to observe that process didn't crash.
 *
 * If this wasn't here, process would exit successfully,
 * demonstrating that 'error' event didn't crash it.
 */
// Hold process for 10s
setTimeout(() => {}, 10000);

/**
 * ERROR HANDLING COMPARISON:
 *
 * ┌──────────────────┬────────────────┬─────────────────┐
 * │    Scenario      │  EventTarget   │  EventEmitter   │
 * ├──────────────────┼────────────────┼─────────────────┤
 * │ No error listener│ Does nothing   │ CRASHES         │
 * │ With listener    │ Calls listener │ Calls listener  │
 * │ Multiple errors  │ All handled    │ All handled     │
 * │ Error propagation│ None           │ Throws if unhandled│
 * └──────────────────┴────────────────┴─────────────────┘
 */

/**
 * WHY EVENTEMITTER HAS SPECIAL ERROR HANDLING?
 *
 * DESIGN PHILOSOPHY:
 * Errors should NEVER be silently ignored.
 * If you emit an error, you MUST handle it.
 *
 * RATIONALE:
 * - In Node.js, errors often indicate serious problems
 * - Silent errors lead to corrupted state
 * - Better to crash than continue with errors
 * - Forces developers to handle errors properly
 *
 * FAIL-FAST PRINCIPLE:
 * Better to crash immediately with clear error
 * than continue with silent corruption.
 *
 * This is why Node.js developers must ALWAYS:
 *   emitter.on('error', handleError);
 */

/**
 * REAL-WORLD EXAMPLES:
 *
 * 1. HTTP SERVER:
 *    server.on('error', (err) => {
 *      console.error('Server error:', err);
 *      process.exit(1);  // Graceful shutdown
 *    });
 *
 * 2. STREAM:
 *    stream.on('error', (err) => {
 *      console.error('Stream error:', err);
 *      stream.destroy();  // Cleanup
 *    });
 *
 * 3. CUSTOM EMITTER:
 *    class Service extends EventEmitter {
 *      constructor() {
 *        super();
 *        this.on('error', this.handleError.bind(this));
 *      }
 *    }
 *
 * FORGETTING error handler is a COMMON Node.js bug!
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. SPECIAL HANDLING: EventEmitter treats 'error' specially
 * 2. ALWAYS REGISTER: error listener on EventEmitters
 * 3. CRASH PROTECTION: Prevents uncaught exceptions
 * 4. EVENTTARGET SAFE: Doesn't crash, but might ignore errors
 * 5. CHOOSE WISELY: EventEmitter enforces error handling
 *
 * PATTERN LESSON:
 * Different event systems have different error semantics.
 * Know your system's behavior to avoid production crashes!
 */
