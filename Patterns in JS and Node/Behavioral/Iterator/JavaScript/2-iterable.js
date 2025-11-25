'use strict';

/**
 * FILE PURPOSE: Iterable Protocol - for-of Compatible
 *
 * This file demonstrates the ITERABLE PROTOCOL which enables:
 * ✅ for-of loops
 * ✅ Spread operator (...)
 * ✅ Array.from()
 * ✅ Destructuring
 *
 * KEY DIFFERENCE from 1-iterator.js:
 * - 1-iterator.js: Just iterator (manual next() only)
 * - 2-iterable.js (this): Iterable (for-of compatible!)
 *
 * ITERABLE PROTOCOL:
 * Object must have [Symbol.iterator]() method that returns an iterator.
 *
 * WHY SYMBOL.ITERATOR?
 * - Symbol ensures unique property (no collisions)
 * - Standard protocol recognized by JavaScript
 * - Enables for-of, spread, and other iteration features
 *
 * PATTERN:
 * Iterable creates fresh iterator on each Symbol.iterator call.
 * This enables multiple independent iterations.
 */

/**
 * Iterable Object
 *
 * Implements ITERABLE PROTOCOL via [Symbol.iterator]() method.
 *
 * ITERABLE vs ITERATOR:
 *
 * ITERATOR (1-iterator.js):
 *   const iter = { next() { } };
 *   iter.next();  // Manual calls
 *   // Can't use: for-of, spread
 *
 * ITERABLE (this file):
 *   const iter = { [Symbol.iterator]() { return iterator; } };
 *   for (const x of iter) { }  // Works!
 *   [...iter]  // Works!
 *
 * KEY INSIGHT:
 * Adding [Symbol.iterator]() unlocks all JavaScript iteration features!
 */
const iterable = {
  /**
   * Symbol.iterator method (Iterable Protocol)
   *
   * @returns {Object} - Iterator with next() method
   *
   * WELL-KNOWN SYMBOL:
   * Symbol.iterator is a well-known symbol in JavaScript.
   * JavaScript recognizes this and uses it for:
   * - for-of loops
   * - Spread operator
   * - Array.from()
   * - Destructuring
   *
   * METHOD PATTERN:
   * [Symbol.iterator]() { ... }
   *
   * Square brackets [] allow computed property names.
   * Symbol.iterator is a symbol value used as property key.
   *
   * FRESH ITERATOR:
   * Each call creates NEW iterator with own state.
   * This allows multiple iterations:
   *   for (const x of iterable) { }  // First iteration
   *   for (const x of iterable) { }  // Second iteration (works!)
   *
   * vs Iterator (1-iterator.js):
   *   const iter = iterator;
   *   for (const x of iter) { }  // First (would work if had Symbol.iterator)
   *   for (const x of iter) { }  // Second (exhausted! wouldn't work)
   *
   * REUSABILITY:
   * Iterable can be iterated multiple times (creates fresh iterator).
   * Iterator consumed after one iteration.
   */
  [Symbol.iterator]() {
    /**
     * Iterator state (fresh for each Symbol.iterator call)
     *
     * CLOSURE:
     * Variable 'i' is closed over by iterator.next().
     * Each Symbol.iterator call creates new 'i'.
     * Multiple iterators have independent state.
     */
    let i = 0;
    
    /**
     * Create iterator object
     *
     * ITERATOR PROTOCOL:
     * Must have next() method.
     *
     * CLOSURE STATE:
     * Closes over 'i' from outer scope.
     * Each next() call modifies this 'i'.
     */
    const iterator = {
      /**
       * Get next value
       *
       * @returns {{value: number, done: boolean}}
       *
       * SAME LOGIC as 1-iterator.js but with local variable.
       *
       * STATE MANAGEMENT:
       * 'i' is closed over (closure).
       * Persists across next() calls.
       * Independent for each iterator.
       */
      next() {
        return {
          value: i++,       // Current value, post-increment
          done: i > 3       // Check after increment
        };
      }
    };
    
    /**
     * Return iterator
     *
     * FRESH ITERATOR:
     * New iterator instance created each time.
     * Has own independent 'i' state.
     */
    return iterator;
  }
};

// ===========================
// Usage: Three Different Ways
// ===========================

/**
 * WAY 1: Manual iteration (same as 1-iterator.js)
 *
 * Get iterator explicitly and call next() manually.
 */
const iterator = iterable[Symbol.iterator]();  // Get fresh iterator
const step1 = iterator.next();  // { value: 0, done: false }
const step2 = iterator.next();  // { value: 1, done: false }
const step3 = iterator.next();  // { value: 2, done: false }
const step4 = iterator.next();  // { value: 3, done: true }
console.log({ step1, step2, step3, step4 });

/**
 * WAY 2: for-of loop (NEW! Not possible in 1-iterator.js)
 *
 * for-of REQUIRES iterable (object with Symbol.iterator).
 *
 * WHAT for-of DOES:
 * 1. Calls iterable[Symbol.iterator]() to get iterator
 * 2. Calls iterator.next() repeatedly
 * 3. Assigns result.value to loop variable
 * 4. Stops when result.done === true
 * 5. Doesn't include last value if done=true on that call
 *
 * EQUIVALENT TO:
 * const iterator = iterable[Symbol.iterator]();
 * while (true) {
 *   const { value, done } = iterator.next();
 *   if (done) break;
 *   const step = value;  // Loop variable
 *   console.log({ step });
 * }
 *
 * EXECUTION:
 * Creates FRESH iterator (new 'i' state).
 * Independent from manual iteration above.
 *
 * OUTPUT:
 * { step: 0 }
 * { step: 1 }
 * { step: 2 }
 *
 * NOTE: Doesn't print value 3 (done=true on that iteration)
 */
for (const step of iterable) {
  console.log({ step });
}

/**
 * WAY 3: Spread operator (NEW! Not possible in 1-iterator.js)
 *
 * SPREAD REQUIRES iterable (object with Symbol.iterator).
 *
 * WHAT SPREAD DOES:
 * 1. Calls iterable[Symbol.iterator]() to get iterator
 * 2. Calls iterator.next() repeatedly
 * 3. Collects all values into array
 * 4. Stops when done=true
 *
 * EQUIVALENT TO:
 * const array = [];
 * const iterator = iterable[Symbol.iterator]();
 * while (true) {
 *   const { value, done } = iterator.next();
 *   if (done) break;
 *   array.push(value);
 * }
 *
 * EXECUTION:
 * Creates ANOTHER fresh iterator (third independent iteration).
 *
 * OUTPUT:
 * { steps: [ 0, 1, 2 ] }
 *
 * Array contains all values where done=false.
 *
 * REUSABILITY DEMONSTRATED:
 * - Manual iteration: Done
 * - for-of loop: Done (fresh iterator)
 * - Spread: Done (fresh iterator)
 *
 * All three work because iterable creates fresh iterator each time!
 */
console.log({ steps: [...iterable] });

/**
 * ITERABLE vs ITERATOR KEY DIFFERENCE:
 *
 * ITERATOR (1-iterator.js):
 * const iter = { next() { } };
 * iter.next();  // 0
 * iter.next();  // 1
 * iter.next();  // 2
 * iter.next();  // done
 * // Consumed! Can't iterate again
 *
 * ITERABLE (this file):
 * const iterable = { [Symbol.iterator]() { return iterator; } };
 * for (const x of iterable) { }  // First iteration
 * for (const x of iterable) { }  // Second iteration (works!)
 * [...iterable]  // Third iteration (works!)
 * // Each creates fresh iterator, so reusable!
 */

/**
 * ITERATION FEATURES ENABLED:
 *
 * Once object is iterable, can use:
 *
 * 1. for-of:
 *    for (const x of iterable) { }
 *
 * 2. Spread:
 *    [...iterable]
 *    fn(...iterable)
 *
 * 3. Destructuring:
 *    const [a, b, c] = iterable;
 *
 * 4. Array.from():
 *    Array.from(iterable)
 *
 * 5. Map/Set constructors:
 *    new Set(iterable)
 *    new Map(iterable)
 *
 * All of these use Symbol.iterator protocol!
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. SYMBOL.ITERATOR: Method that returns iterator
 * 2. ITERABLE: Object with [Symbol.iterator]()
 * 3. FOR-OF: Works with iterables
 * 4. SPREAD: Works with iterables
 * 5. REUSABLE: Creates fresh iterator each time
 * 6. STANDARD: JavaScript recognizes Symbol.iterator
 *
 * COMPARISON:
 * - 1-iterator.js: Iterator only (manual next())
 * - 2-iterable.js: Iterable (for-of, spread work!)
 *
 * NEXT FILES:
 * - 3-class.js: Class-based iterable
 * - 4-array.js: Built-in iterables
 * - 5-generator.js: Generators (easy mode!)
 */
