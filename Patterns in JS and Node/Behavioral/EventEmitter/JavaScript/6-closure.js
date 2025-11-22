'use strict';

/**
 * FILE PURPOSE: Closure-Based EventEmitter
 *
 * This file demonstrates EventEmitter using CLOSURES for encapsulation
 * instead of prototypes or classes.
 *
 * KEY DIFFERENCES from 1-simple.js:
 * - 1-simple.js: Uses constructor + prototype (this.events)
 * - 6-closure.js: Uses closure (const events in outer scope)
 *
 * BENEFITS OF CLOSURE APPROACH:
 * ✅ TRUE PRIVACY: events variable is truly private (not accessible outside)
 * ✅ NO 'this': Avoids this-binding issues in JavaScript
 * ✅ FACTORY PATTERN: Returns new instance per call
 * ✅ FUNCTIONAL STYLE: Functions returning objects
 * ✅ SIMPLER: No prototype chain, no constructor
 *
 * PATTERN: Module Pattern + Factory Function
 * - Outer function creates scope
 * - Inner functions close over scope variables
 * - Return object with methods
 *
 * THIS IS A FUNDAMENTAL JAVASCRIPT PATTERN!
 * Used extensively in functional programming and modern JavaScript.
 */

/**
 * Factory Function: Create EventEmitter
 *
 * Returns a new EventEmitter instance using closure for state.
 * Each call creates independent emitter with private events registry.
 *
 * @returns {Object} - EventEmitter API { on, emit }
 *
 * CLOSURE PATTERN:
 *
 * const emitter = () => {
 *   const private = {};        // Private variable (closure)
 *   return {
 *     method: () => private    // Method accesses private via closure
 *   };
 * };
 *
 * PRIVACY GUARANTEE:
 *
 * const ee = emitter();
 * ee.events  // undefined - not accessible!
 *
 * Compare to prototype version:
 * const ee = new EventEmitter();
 * ee.events  // { } - accessible! Can be modified!
 *
 * Closures provide REAL privacy that prototypes can't.
 */
const emitter = () => {
  /**
   * Private events registry (via closure)
   *
   * PRIVACY:
   * This variable is NOT accessible outside the emitter() function.
   * Only the returned methods (on, emit) can access it.
   *
   * CLOSURE MAGIC:
   * Even though emitter() function returns and its scope is gone,
   * the returned methods still "remember" and can access 'events'.
   *
   * This is how closures provide encapsulation in JavaScript!
   *
   * STRUCTURE:
   * {
   *   'event1': [listener1, listener2],
   *   'event2': [listener3]
   * }
   *
   * Same as 1-simple.js, but truly private.
   */
  const events = {};
  
  /**
   * Return EventEmitter API
   *
   * Object with on() and emit() methods.
   * Both methods close over 'events' variable.
   *
   * CLOSURE IN ACTION:
   * - events defined in outer scope
   * - on() and emit() defined in returned object
   * - Both can access events (closure)
   * - events cannot be accessed from outside
   *
   * API SURFACE:
   * {
   *   on: Function,
   *   emit: Function
   * }
   *
   * Same API as 1-simple.js, different implementation.
   */
  return {
    /**
     * Register listener (same logic as 1-simple.js)
     *
     * CLOSURE ACCESS:
     * This arrow function closes over 'events' from outer scope.
     * Can read and modify 'events' even though it's in parent scope.
     *
     * @param {string} name - Event name
     * @param {Function} fn - Listener function
     *
     * EXECUTION:
     * Same as prototype version, but accesses events via closure.
     *
     * ARROW FUNCTION BENEFITS:
     * - Lexical 'this' (not that we use it here)
     * - Concise syntax
     * - Implicit closure
     */
    on: (name, fn) => {
      const event = events[name];  // Access via closure
      if (event) event.push(fn);
      else events[name] = [fn];
    },
    
    /**
     * Emit event (same logic as 1-simple.js)
     *
     * CLOSURE ACCESS:
     * Accesses 'events' via closure.
     *
     * @param {string} name - Event name
     * @param {...any} data - Event data
     *
     * DIFFERENCE from 1-simple.js:
     * Uses forEach instead of for-of loop (same result).
     *
     * WHY forEach?
     * More functional style, matches the overall approach.
     *
     * COULD ALSO USE:
     * - for (const fn of event) fn(...data)  // Same performance
     * - event.map(fn => fn(...data))         // Creates unused array
     */
    emit: (name, ...data) => {
      const event = events[name];  // Access via closure
      if (event) event.forEach((fn) => fn(...data));
    },
  };
};

// ===========================
// Usage Example
// ===========================

/**
 * Create emitter using factory function
 *
 * COMPARISON:
 *
 * Prototype (1-simple.js):
 *   const ee = new EventEmitter();
 *
 * Closure (this file):
 *   const ee = emitter();
 *
 * RESULT IS SIMILAR:
 * ee = { on: Function, emit: Function }
 *
 * But closure version has truly private 'events'.
 */
const ee = emitter();

/**
 * Register listener (same usage as prototype version)
 */
ee.on('event1', (data) => {
  console.dir(data);
});

/**
 * Emit event (same usage as prototype version)
 *
 * OUTPUT: { a: 5 }
 */
ee.emit('event1', { a: 5 });

/**
 * TESTING PRIVACY:
 *
 * Prototype version (1-simple.js):
 *   const ee = new EventEmitter();
 *   ee.events  // { } - ACCESSIBLE!
 *   ee.events = null;  // Can break it!
 *
 * Closure version (this file):
 *   const ee = emitter();
 *   ee.events  // undefined - NOT ACCESSIBLE!
 *   ee.events = null;  // Doesn't affect internal events
 *
 * The closure version provides real encapsulation!
 */

/**
 * CLOSURE EXPLANATION:
 *
 * What is a closure?
 * When a function is created, it "closes over" its surrounding scope.
 * It remembers variables from that scope even after scope is gone.
 *
 * In this example:
 *
 * const emitter = () => {
 *   const events = {};     // ← Scope 1 (emitter function)
 *   return {
 *     on: () => events,    // ← Scope 2 (on function)
 *     emit: () => events   // ← Scope 2 (emit function)
 *   };
 * };
 *
 * When emitter() returns:
 * - Scope 1 is technically "done"
 * - But on() and emit() still reference events
 * - JavaScript keeps events in memory
 * - on() and emit() can still access it
 * - But nothing else can!
 *
 * This is closure - inner function accessing outer scope.
 */

/**
 * FACTORY PATTERN BENEFITS:
 *
 * 1. MULTIPLE INDEPENDENT INSTANCES:
 *    const ee1 = emitter();
 *    const ee2 = emitter();
 *    // ee1 and ee2 have separate event registries
 *    // ee1.emit() doesn't affect ee2
 *
 * 2. NO NEW KEYWORD:
 *    const ee = emitter();  // No 'new', just call
 *    // Cleaner, more functional
 *
 * 3. EASY TO ENHANCE:
 *    const emitter = (options) => {
 *      const events = {};
 *      const maxListeners = options.maxListeners || 10;
 *      return { on, emit };
 *    };
 *
 * 4. COMPOSABLE:
 *    const logger = emitter();
 *    const cache = emitter();
 *    const combined = { logger, cache };
 */

/**
 * MEMORY COMPARISON:
 *
 * Prototype (1-simple.js):
 * - Methods shared via prototype
 * - More memory efficient for many instances
 * - this.events = {} per instance
 *
 * Closure (this file):
 * - Methods created per instance
 * - More memory per instance
 * - events = {} per instance (via closure)
 *
 * TRADE-OFF:
 * - Prototype: Better memory, public events
 * - Closure: Worse memory, private events
 *
 * FOR MOST APPS: Closure is fine (better encapsulation)
 * FOR MANY INSTANCES: Prototype is better (shared methods)
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. CLOSURE: Private variables via function scope
 * 2. FACTORY: Function that returns object
 * 3. ENCAPSULATION: True privacy (events not accessible)
 * 4. FUNCTIONAL: No 'this', no 'new', just functions
 * 5. SAME API: on() and emit() work identically
 *
 * COMPARISON:
 * - 1-simple.js: Prototype (public events, shared methods)
 * - 6-closure.js: Closure (private events, per-instance methods)
 *
 * Both valid - choose based on needs:
 * - Need privacy? Use closure
 * - Many instances? Use prototype
 * - Default choice? Use closure (better encapsulation)
 *
 * NEXT FILES:
 * - 7-closure.js: Ultra-compact version
 * - 8-methods.js: Full-featured API
 * - b-class.js: ES6 class version
 */
