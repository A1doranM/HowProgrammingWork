'use strict';

/**
 * FILE PURPOSE: Wildcard EventEmitter - Bug Fixed
 *
 * This file fixes the infinite loop bug from 3-enhanced.js.
 *
 * THE BUG IN 3-enhanced.js:
 * If someone calls ee.emit('*', data), it creates infinite recursion:
 *
 * emit('*', data)
 *   → emit original: '*' listeners called
 *   → unshift('*'): args = ['*', '*', data]
 *   → emit again: '*' listeners called with ('*', data)
 *   → unshift('*'): args = ['*', '*', '*', data]
 *   → emit again: ... INFINITE RECURSION!
 *   → Stack overflow!
 *
 * THE FIX:
 * ✅ Prevent direct emission of '*' event
 * ✅ Throw error if someone tries to emit('*')
 * ✅ '*' is now a RESERVED event name
 *
 * PATTERN: Guard Clause
 * Check for invalid input and fail fast.
 *
 * COMPARISON:
 * - 3-enhanced.js: Works until someone emits('*') ⚠️
 * - 4-star-fix.js: Prevents the bug ✅
 */

const events = require('node:events');

/**
 * Factory: Create Enhanced EventEmitter (Bug-Free Version)
 *
 * Same as 3-enhanced.js but with guard clause to prevent '*' emission.
 *
 * @returns {EventEmitter} - Safe enhanced emitter
 */
const emitter = () => {
  const ee = new events.EventEmitter();
  
  /**
   * Save original emit method (same as 3-enhanced.js)
   */
  const emit = ee.emit;
  
  /**
   * Override emit with bug-protected version
   *
   * ENHANCEMENT: Wildcard support + bug prevention
   *
   * @param {...any} args - [eventName, ...eventData]
   * @throws {Error} - If eventName is '*' (reserved)
   *
   * EXECUTION FLOW:
   *
   * ee.emit('click', { x: 10 })
   *   ↓
   * 1. Extract name: 'click'
   *   ↓
   * 2. Guard: name === '*'? No, continue
   *   ↓
   * 3. emit.apply(ee, ['click', { x: 10 }])
   *    → Calls specific 'click' listeners
   *   ↓
   * 4. args.unshift('*')
   *    → args = ['*', 'click', { x: 10 }]
   *   ↓
   * 5. emit.apply(ee, ['*', 'click', { x: 10 }])
   *    → Calls wildcard '*' listeners
   *    → wildcard listener receives ('click', { x: 10 })
   *
   * PROTECTED FLOW (bug prevention):
   *
   * ee.emit('*', data)  // ⚠️ Attempting to emit reserved event
   *   ↓
   * 1. Extract name: '*'
   *   ↓
   * 2. Guard: name === '*'? YES!
   *   ↓
   * 3. throw Error('Event name "*" is reserved')
   *   ↓
   * STOPPED! No infinite loop!
   */
  ee.emit = (...args) => {
    /**
     * Extract event name from arguments
     *
     * args[0] is always the event name.
     * Use destructuring for cleaner code.
     */
    const [name] = args;
    
    /**
     * GUARD CLAUSE: Prevent '*' emission
     *
     * WHY THIS IS NECESSARY:
     *
     * Without this check:
     *   emit('*') → emit('*') → emit('*') → ... INFINITE!
     *
     * With this check:
     *   emit('*') → throw Error → STOPPED
     *
     * DESIGN DECISION:
     * '*' is a RESERVED event name for internal use only.
     * Users can listen to '*' but cannot emit it directly.
     *
     * ALTERNATIVE APPROACHES:
     * 1. Silently ignore: if (name === '*') return;
     * 2. Only emit wildcard: if (name !== '*') emit wildcard;
     * 3. Different wildcard name: '__all__' or Symbol
     *
     * CHOSEN APPROACH:
     * Throw error - makes the rule explicit and prevents bugs.
     */
    if (name === '*') {
      throw new Error('Event name "*" is reserved');
    }
    
    /**
     * Emit specific event (same as 3-enhanced.js)
     *
     * Calls all listeners registered for this specific event name.
     *
     * Example:
     *   ee.on('click', listener1)
     *   ee.emit('click', data)
     *   → listener1(data) is called
     */
    emit.apply(ee, args);
    
    /**
     * Emit wildcard event (same as 3-enhanced.js)
     *
     * Prepend '*' to args and emit again.
     * This notifies all wildcard listeners.
     *
     * ARGS TRANSFORMATION:
     * Before: ['click', { x: 10 }]
     * After:  ['*', 'click', { x: 10 }]
     *
     * WILDCARD LISTENER SIGNATURE:
     * ee.on('*', (eventName, ...eventData) => { })
     *          ↑         ↑
     *        '*'     actual event name
     */
    args.unshift('*');
    emit.apply(ee, args);
  };
  
  return ee;
};

module.exports = emitter;

/**
 * USAGE EXAMPLE (see 5-usage.js):
 *
 * const emitter = require('./4-star-fix.js');
 * const ee = emitter();
 *
 * // Specific event listener
 * ee.on('event1', (data) => {
 *   console.log('Specific event');
 *   console.dir(data);
 * });
 *
 * // Wildcard listener
 * ee.on('*', (name, data) => {
 *   console.log('Any event');
 *   console.dir([name, data]);
 * });
 *
 * ee.emit('event1', { a: 5 });
 * // Output:
 * // Specific event
 * // { a: 5 }
 * // Any event
 * // [ 'event1', { a: 5 } ]
 *
 * ee.emit('event2', { a: 500 });
 * // Output:
 * // Any event
 * // [ 'event2', { a: 500 } ]
 *
 * ee.emit('*', { a: 700 });  // ⚠️ THROWS ERROR!
 * // Error: Event name "*" is reserved
 */

/**
 * BUG FIX SUMMARY:
 *
 * PROBLEM:
 * emit('*') causes infinite recursion
 *
 * ROOT CAUSE:
 * Emitting '*' triggers wildcard logic which emits '*' again
 *
 * SOLUTION:
 * Throw error when attempting to emit('*')
 *
 * PREVENTION:
 * if (name === '*') throw new Error(...)
 *
 * RESULT:
 * ✅ Wildcard feature works safely
 * ✅ Infinite recursion prevented
 * ✅ Clear error message for developers
 */

/**
 * ALTERNATIVE SOLUTIONS:
 *
 * 1. SILENT IGNORE:
 *    if (name === '*') return;
 *    // Pros: No error thrown
 *    // Cons: Silent failure, hard to debug
 *
 * 2. DIFFERENT WILDCARD:
 *    const WILDCARD = Symbol('wildcard');
 *    ee.on(WILDCARD, listener);
 *    // Pros: Can't accidentally emit Symbol
 *    // Cons: Less intuitive API
 *
 * 3. CONDITIONAL WILDCARD:
 *    if (name !== '*') {
 *      args.unshift('*');
 *      emit.apply(ee, args);
 *    }
 *    // Pros: Simpler
 *    // Cons: Still could emit '*' (just no wildcard)
 *
 * CHOSEN SOLUTION:
 * Throw error - fail fast, clear feedback, prevents misuse.
 */

/**
 * KEY LESSONS:
 *
 * 1. GUARD CLAUSES: Validate input early
 * 2. FAIL FAST: Throw errors for invalid usage
 * 3. RESERVED NAMES: Some identifiers have special meaning
 * 4. RECURSIVE BUGS: Watch for self-triggering logic
 * 5. CLEAR ERRORS: Error messages should explain the rule
 *
 * NEXT FILES:
 * - 5-usage.js: Demonstrates the fixed wildcard behavior
 * - 6-closure.js: Closure-based implementation
 * - 8-methods.js: Full-featured API
 */
