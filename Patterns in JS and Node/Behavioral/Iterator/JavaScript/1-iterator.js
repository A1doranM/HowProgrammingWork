'use strict';

/**
 * FILE PURPOSE: Basic Iterator Protocol
 *
 * This file demonstrates the fundamental ITERATOR PROTOCOL in JavaScript.
 *
 * ITERATOR PROTOCOL:
 * An object is an iterator if it has a next() method that returns:
 * { value: any, done: boolean }
 *
 * This is the foundation of iteration in JavaScript.
 * Understanding this is essential for:
 * - for-of loops
 * - Spread operator
 * - Array.from()
 * - Generators
 * - Custom iteration
 *
 * KEY CONCEPT:
 * Iterator maintains INTERNAL STATE (position in sequence).
 * Each next() call advances to next element.
 *
 * LIMITATION OF THIS FILE:
 * This is just an iterator, NOT an iterable.
 * Can't use with for-of or spread (see 2-iterable.js).
 */

/**
 * Basic Iterator Object
 *
 * Implements Iterator Protocol with next() method.
 *
 * ITERATOR PROTOCOL REQUIREMENTS:
 * Must have next() method that returns:
 * {
 *   value: any,      // Current value in sequence
 *   done: boolean    // true if sequence exhausted
 * }
 *
 * STATE:
 * - counter: Current position in sequence (internal state)
 *
 * BEHAVIOR:
 * - next() returns current value and advances position
 * - Once done=true, typically stays done
 *
 * NOT ITERABLE:
 * Missing [Symbol.iterator]() method.
 * Can't use with for-of or spread.
 * Must call next() manually.
 */
const iterator = {
  /**
   * Internal state: current position
   *
   * MUTABLE STATE:
   * Iterator maintains position across next() calls.
   * This is what makes iteration stateful.
   */
  counter: 0,
  
  /**
   * Get next value in sequence
   *
   * @returns {Object} - { value, done }
   *
   * RETURN VALUE STRUCTURE:
   * {
   *   value: any,       // The current value
   *   done: boolean     // true if no more values
   * }
   *
   * EXECUTION FLOW:
   *
   * Call 1: next()
   *   → value: this.counter++ → 0 (then counter becomes 1)
   *   → done: 1 > 3 → false
   *   → return: { value: 0, done: false }
   *
   * Call 2: next()
   *   → value: this.counter++ → 1 (then counter becomes 2)
   *   → done: 2 > 3 → false
   *   → return: { value: 1, done: false }
   *
   * Call 3: next()
   *   → value: this.counter++ → 2 (then counter becomes 3)
   *   → done: 3 > 3 → false
   *   → return: { value: 2, done: false }
   *
   * Call 4: next()
   *   → value: this.counter++ → 3 (then counter becomes 4)
   *   → done: 4 > 3 → true
   *   → return: { value: 3, done: true }
   *
   * DONE STATE:
   * Once done=true, the iterator is exhausted.
   * Further calls typically return { value: undefined, done: true }.
   *
   * POST-INCREMENT:
   * this.counter++ returns current value THEN increments.
   * So value is current, but counter is already advanced for next call.
   *
   * EDGE CASE:
   * value: 3 with done: true
   * Last value returned with done flag set.
   * Consumer should check done before using value.
   */
  next() {
    return {
      value: this.counter++, // Current value, then increment
      done: this.counter > 3 // Check if exhausted after increment
    };
  }
};

// ===========================
// Usage: Manual next() Calls
// ===========================

/**
 * Consume iterator manually
 *
 * Must call next() explicitly for each step.
 * Can't use for-of because this is iterator, not iterable.
 *
 * MANUAL ITERATION:
 * This is what for-of does internally!
 * But for-of requires iterable (object with Symbol.iterator).
 */

/**
 * Step 1: Get first value
 *
 * RESULT: { value: 0, done: false }
 * - value: 0 (first in sequence)
 * - done: false (more values remain)
 */
const step1 = iterator.next();

/**
 * Step 2: Get second value
 *
 * RESULT: { value: 1, done: false }
 * - value: 1 (second in sequence)
 * - done: false (more values remain)
 */
const step2 = iterator.next();

/**
 * Step 3: Get third value
 *
 * RESULT: { value: 2, done: false }
 * - value: 2 (third in sequence)
 * - done: false (last value before done)
 */
const step3 = iterator.next();

/**
 * Step 4: Exhausted
 *
 * RESULT: { value: 3, done: true }
 * - value: 3 (included even though done=true)
 * - done: true (no more values after this)
 *
 * IMPORTANT:
 * Last value returned WITH done=true.
 * Consumer should check done flag.
 */
const step4 = iterator.next();

/**
 * Display all steps
 *
 * OUTPUT:
 * {
 *   step1: { value: 0, done: false },
 *   step2: { value: 1, done: false },
 *   step3: { value: 2, done: false },
 *   step4: { value: 3, done: true }
 * }
 *
 * OBSERVATION:
 * - First 3 calls: done=false (values 0, 1, 2)
 * - Fourth call: done=true (value 3)
 * - Pattern: value returned even when done=true
 */
console.log({ step1, step2, step3, step4 });

/**
 * ITERATOR PROTOCOL SUMMARY:
 *
 * WHAT IS ITERATOR?
 * Object with next() method returning { value, done }
 *
 * ITERATOR vs ITERABLE:
 * - Iterator: Has next() method
 * - Iterable: Has [Symbol.iterator]() method
 *
 * THIS FILE:
 * Just iterator (can't use with for-of)
 *
 * NEXT FILE (2-iterable.js):
 * Adds Symbol.iterator to make it iterable (for-of compatible)
 *
 * MANUAL ITERATION:
 * while (true) {
 *   const { value, done } = iterator.next();
 *   if (done) break;
 *   console.log(value);
 * }
 *
 * This is what for-of does automatically!
 */

/**
 * WHY ITERATOR PATTERN?
 *
 * 1. SEQUENTIAL ACCESS:
 *    Access elements one at a time
 *
 * 2. STATEFUL:
 *    Remembers position between calls
 *
 * 3. LAZY:
 *    Values computed on demand (if iterator generates them)
 *
 * 4. UNIFORM:
 *    Same interface for any collection type
 *
 * 5. DECOUPLING:
 *    Consumer doesn't know collection's internal structure
 *
 * LIMITATION:
 * This basic iterator can't be used with for-of or spread.
 * Need iterable protocol (see next file).
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. ITERATOR: Object with next() method
 * 2. NEXT(): Returns { value, done }
 * 3. STATE: Maintains position internally
 * 4. DONE: Signals end of sequence
 * 5. MANUAL: Must call next() explicitly
 * 6. NOT FOR-OF: Missing Symbol.iterator
 *
 * This is the FOUNDATION of JavaScript iteration!
 *
 * NEXT FILE: 2-iterable.js adds Symbol.iterator
 */
