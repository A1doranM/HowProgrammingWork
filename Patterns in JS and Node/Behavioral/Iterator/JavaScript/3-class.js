'use strict';

/**
 * FILE PURPOSE: Class-Based Iterable - Configurable Range Iterator
 *
 * This file demonstrates creating a REUSABLE ITERABLE CLASS
 * that generates number sequences with custom range and step.
 *
 * IMPROVEMENTS over 2-iterable.js:
 * ✅ Configurable (begin, end, step parameters)
 * ✅ Reusable class (create multiple instances)
 * ✅ Clear encapsulation (class syntax)
 * ✅ Instance methods (Symbol.iterator on prototype)
 *
 * PATTERN:
 * Class implements iterable protocol.
 * Each instance can be iterated independently.
 * Each iteration creates fresh iterator.
 *
 * REAL-WORLD USAGE:
 * This is how you make custom data structures iterable:
 * - LinkedList, Tree, Graph, etc.
 * - Custom collections with specific iteration logic
 * - Configurable sequences (ranges, progressions, etc.)
 *
 * COMPARISON:
 * - 2-iterable.js: Single-use object literal
 * - 3-class.js (this): Reusable class with parameters
 */

/**
 * Counter Class - Configurable Number Sequence Iterator
 *
 * Creates iterable sequences like range(start, end, step).
 *
 * ITERABLE IMPLEMENTATION:
 * Implements iterable protocol via [Symbol.iterator]() method.
 *
 * CLASS BENEFITS:
 * ✅ Multiple instances (const c1 = new Counter(0,10), c2 = new Counter(20,30))
 * ✅ Configuration via constructor
 * ✅ Prototype methods (Symbol.iterator shared via prototype)
 * ✅ Clear API (counter.begin, counter.end, counter.step)
 *
 * EXAMPLES:
 * new Counter(0, 10)       → [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * new Counter(0, 10, 2)    → [0, 2, 4, 6, 8, 10]
 * new Counter(5, 15, 3)    → [5, 8, 11, 14]
 * new Counter(10, 0, -1)   → [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
 */
class Counter {
  /**
   * Create configurable counter
   *
   * @param {number} begin - Starting value (inclusive)
   * @param {number} end - Ending value (inclusive)
   * @param {number} step - Step size (default: 1, can be negative)
   *
   * CONFIGURATION:
   * Stores iteration parameters as instance properties.
   * Used by Symbol.iterator to create iterators with correct range.
   *
   * EXAMPLES:
   * new Counter(0, 5)     → 0, 1, 2, 3, 4, 5
   * new Counter(0, 5, 2)  → 0, 2, 4
   * new Counter(10, 5, -1) → 10, 9, 8, 7, 6, 5
   */
  constructor(begin, end, step = 1) {
    this.begin = begin;  // Start value
    this.end = end;      // End value (inclusive)
    this.step = step;    // Increment (can be negative)
  }
  
  /**
   * Implement iterable protocol
   *
   * METHOD ON PROTOTYPE:
   * This method is on Counter.prototype, shared by all instances.
   * Each instance's Symbol.iterator creates its own iterator.
   *
   * @returns {Object} - Iterator with next() method
   *
   * FRESH ITERATOR PER CALL:
   * Each Symbol.iterator call creates NEW iterator.
   * Multiple iterations of same Counter work independently.
   *
   * CLOSURE OVER CONFIGURATION:
   * Iterator closes over begin, end, step from instance.
   * Iterator has own 'i' state independent of class instance.
   *
   * EXECUTION:
   *
   * const counter = new Counter(0, 3);
   * const iter1 = counter[Symbol.iterator]();
   * const iter2 = counter[Symbol.iterator]();
   * // iter1 and iter2 are INDEPENDENT iterators
   * // Both iterate 0, 1, 2, 3 independently
   */
  [Symbol.iterator]() {
    /**
     * Capture configuration from instance
     *
     * WHY CAPTURE?
     * Iterator is a separate object from Counter instance.
     * Must capture values to close over them.
     *
     * IMMUTABLE CAPTURE:
     * Even if instance properties change after iterator creation,
     * this iterator uses captured values (closure).
     */
    const end = this.end;
    const step = this.step;
    
    /**
     * Iterator state
     *
     * INITIALIZATION:
     * Start at this.begin (captured in 'i').
     *
     * INDEPENDENT STATE:
     * Each Symbol.iterator call creates new 'i'.
     * Multiple iterators have independent positions.
     */
    let i = this.begin;
    
    /**
     * Create iterator object
     *
     * CLOSURE:
     * Closes over: i, end, step
     * All three accessible in next() method.
     */
    const iterator = {
      /**
       * Get next value in sequence
       *
       * @returns {{value: number, done: boolean}}
       *
       * ALGORITHM:
       * 1. Create result with current value and done status
       * 2. Advance position by step
       * 3. Return result
       *
       * EXECUTION for Counter(0, 3, 1):
       *
       * Call 1:
       *   item = { value: 0, done: 0 > 3 = false }
       *   i += 1 → i = 1
       *   return { value: 0, done: false }
       *
       * Call 2:
       *   item = { value: 1, done: 1 > 3 = false }
       *   i += 1 → i = 2
       *   return { value: 1, done: false }
       *
       * Call 3:
       *   item = { value: 2, done: 2 > 3 = false }
       *   i += 1 → i = 3
       *   return { value: 2, done: false }
       *
       * Call 4:
       *   item = { value: 3, done: 3 > 3 = false }
       *   i += 1 → i = 4
       *   return { value: 3, done: false }
       *
       * Call 5:
       *   item = { value: 4, done: 4 > 3 = true }
       *   i += 1 → i = 5
       *   return { value: 4, done: true }
       *
       * INCLUSIVE END:
       * end value is INCLUDED in sequence (done check after value).
       *
       * STEP HANDLING:
       * Works with any step (positive, negative, fractional).
       */
      next() {
        const item = {
          value: i,           // Current position
          done: i > end       // Check if past end
        };
        i += step;            // Advance by step
        return item;
      }
    };
    
    return iterator;
  }
}

// ===========================
// Usage: Configurable Counter
// ===========================

/**
 * Create Counter instance
 *
 * CONFIGURATION: begin=0, end=3, step=1 (default)
 * SEQUENCE: 0, 1, 2, 3 (inclusive)
 *
 * REUSABLE:
 * This instance can be iterated multiple times.
 * Each iteration creates fresh iterator.
 */
const iterable = new Counter(0, 3);

/**
 * Example 1: Manual iteration
 *
 * Same pattern as previous files.
 */
const iterator = iterable[Symbol.iterator]();
const step1 = iterator.next();  // { value: 0, done: false }
const step2 = iterator.next();  // { value: 1, done: false }
const step3 = iterator.next();  // { value: 2, done: false }
const step4 = iterator.next();  // { value: 3, done: false }
console.log({ step1, step2, step3, step4 });

/**
 * Example 2: for-of loop
 *
 * FRESH ITERATION:
 * Creates new iterator (independent from manual iteration above).
 *
 * OUTPUT:
 * { step: 0 }
 * { step: 1 }
 * { step: 2 }
 * { step: 3 }
 */
for (const step of iterable) {
  console.log({ step });
}

/**
 * Example 3: Spread operator
 *
 * ANOTHER FRESH ITERATION:
 * Third independent iteration of same Counter instance.
 *
 * OUTPUT:
 * { steps: [0, 1, 2, 3] }
 */
console.log({ steps: [...iterable] });

/**
 * CLASS-BASED PATTERN BENEFITS:
 *
 * 1. MULTIPLE INSTANCES:
 *    const c1 = new Counter(0, 10);
 *    const c2 = new Counter(20, 30);
 *    // Two independent sequences
 *
 * 2. CONFIGURATION:
 *    const evens = new Counter(0, 10, 2);    // 0, 2, 4, 6, 8, 10
 *    const odds = new Counter(1, 10, 2);     // 1, 3, 5, 7, 9
 *    const countdown = new Counter(10, 0, -1); // 10, 9, 8..., 0
 *
 * 3. REUSABILITY:
 *    const counter = new Counter(0, 5);
 *    for (const x of counter) { }  // First use
 *    for (const x of counter) { }  // Second use (works!)
 *
 * 4. TYPE-SAFE:
 *    Can add TypeScript types, instanceof checks
 *
 * 5. EXTENSIBILITY:
 *    class SkipCounter extends Counter {
 *      [Symbol.iterator]() {
 *        // Custom iteration logic
 *      }
 *    }
 */

/**
 * REAL-WORLD CUSTOM ITERABLE CLASSES:
 *
 * 1. LINKED LIST:
 */
/*
class LinkedList {
  *[Symbol.iterator]() {  // Generator method (simpler!)
    let node = this.head;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }
}
*/

/**
 * 2. BINARY TREE:
 */
/*
class BinaryTree {
  *[Symbol.iterator]() {  // In-order traversal
    if (this.left) yield* this.left;
    yield this.value;
    if (this.right) yield* this.right;
  }
}
*/

/**
 * 3. CUSTOM COLLECTION:
 */
/*
class CircularBuffer {
  *[Symbol.iterator]() {
    let i = 0;
    while (i < this.size) {
      yield this.buffer[(this.start + i) % this.capacity];
      i++;
    }
  }
}
*/

/**
 * GENERATOR METHOD SYNTAX:
 *
 * Instead of:
 *   [Symbol.iterator]() {
 *     return iterator;
 *   }
 *
 * Can use generator method:
 *   *[Symbol.iterator]() {
 *     yield values;
 *   }
 *
 * Even simpler! See next files for generator approach.
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. CLASS: Reusable iterable with configuration
 * 2. INSTANCES: Each can be iterated independently
 * 3. CONFIGURABLE: Constructor parameters customize iteration
 * 4. PROTOTYPE: Symbol.iterator shared via prototype
 * 5. FRESH ITERATOR: Each iteration creates new iterator
 * 6. EXTENSIBLE: Can subclass for custom behavior
 *
 * COMPARISON:
 * - 2-iterable.js: Object literal (single-use)
 * - 3-class.js: Class (reusable, configurable)
 * - 5-generator.js: Generator function (simplest for iteration logic)
 *
 * WHEN TO USE CLASS:
 * ✅ Need multiple instances with different configs
 * ✅ Want to extend via inheritance
 * ✅ Need instanceof checks
 * ✅ Complex state beyond just iteration
 *
 * NEXT FILES:
 * - 4-array.js: Built-in iterables
 * - 5-generator.js: Modern generator approach
 */
