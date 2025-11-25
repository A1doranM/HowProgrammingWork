'use strict';

/**
 * FILE PURPOSE: Built-in Iterables - Arrays Have Iterator Protocol
 *
 * This file demonstrates that JavaScript's built-in types ALREADY
 * implement the iterable protocol.
 *
 * BUILT-IN ITERABLES:
 * - Array
 * - String
 * - Map
 * - Set
 * - TypedArray (Uint8Array, Int32Array, etc.)
 * - arguments object
 * - NodeList (DOM)
 * - HTMLCollection (DOM)
 *
 * YOU DON'T NEED TO IMPLEMENT:
 * Arrays, Sets, Maps, etc. already have [Symbol.iterator]()!
 *
 * THIS FILE SHOWS:
 * How to USE the iterator protocol with built-in types.
 * You can call [Symbol.iterator]() on any built-in collection.
 *
 * COMPARISON TO CUSTOM ITERABLES:
 * - 1-3: Implemented our own iterators/iterables
 * - 4 (this): Uses JavaScript's built-in implementation
 * - Same protocol, no custom code needed!
 *
 * KEY INSIGHT:
 * The Iterator pattern is built INTO JavaScript!
 * All collections use it consistently.
 */

/**
 * Built-in Iterable: Array
 *
 * Arrays in JavaScript automatically implement iterable protocol.
 *
 * WHAT JAVASCRIPT DOES INTERNALLY:
 *
 * Array.prototype[Symbol.iterator] = function() {
 *   let i = 0;
 *   const self = this;
 *   return {
 *     next() {
 *       return {
 *         value: self[i],
 *         done: i++ >= self.length
 *       };
 *     }
 *   };
 * };
 *
 * This is already implemented for you!
 *
 * ARRAY ITERATION:
 * - Traverses elements in order
 * - From index 0 to length-1
 * - Done when index >= length
 *
 * SAME API as our custom iterables from previous files!
 */
const iterable = [0, 1, 2];

// ===========================
// Usage: Same Three Patterns
// ===========================

/**
 * Example 1: Manual iteration with built-in iterator
 *
 * ACCESSING BUILT-IN ITERATOR:
 * Arrays have [Symbol.iterator]() method.
 * Can access it explicitly to get iterator.
 *
 * WHY DO THIS?
 * - Understand what for-of does internally
 * - Need fine-grained control
 * - Want to pause iteration
 * - Inspect iterator state
 *
 * NORMALLY:
 * Just use for-of or spread (simpler).
 * This is for educational purposes.
 */
const iterator = iterable[Symbol.iterator]();

/**
 * Call next() manually on built-in iterator
 *
 * EXECUTION:
 * Array's built-in iterator tracks position internally.
 * Each next() advances to next element.
 */
const step1 = iterator.next();  // { value: 0, done: false }
const step2 = iterator.next();  // { value: 1, done: false }
const step3 = iterator.next();  // { value: 2, done: false }
const step4 = iterator.next();  // { value: undefined, done: true }

console.log({ step1, step2, step3, step4 });
// Output: Same as our custom implementations!
// But using JavaScript's built-in iterator

/**
 * Example 2: for-of with built-in iterable
 *
 * STANDARD USAGE:
 * This is how you NORMALLY iterate arrays.
 *
 * for-of INTERNALLY:
 * 1. Calls iterable[Symbol.iterator]()
 * 2. Calls next() repeatedly
 * 3. Assigns value to loop variable
 * 4. Stops when done=true
 *
 * FRESH ITERATION:
 * Creates new iterator (independent from manual iteration above).
 *
 * OUTPUT:
 * { step: 0 }
 * { step: 1 }
 * { step: 2 }
 */
for (const step of iterable) {
  console.log({ step });
}

/**
 * Example 3: Spread with built-in iterable
 *
 * SPREAD USAGE:
 * Common way to copy or convert iterables to arrays.
 *
 * INTERNALLY:
 * 1. Gets iterator via Symbol.iterator
 * 2. Calls next() until done
 * 3. Collects values into new array
 *
 * OUTPUT:
 * { steps: [0, 1, 2] }
 */
console.log({ steps: [...iterable] });

/**
 * OTHER BUILT-IN ITERABLES:
 *
 * STRING:
 *   const str = "hello";
 *   for (const char of str) console.log(char);
 *   // 'h', 'e', 'l', 'l', 'o'
 *
 * SET:
 *   const set = new Set([1, 2, 3]);
 *   for (const value of set) console.log(value);
 *   // 1, 2, 3
 *
 * MAP:
 *   const map = new Map([['a', 1], ['b', 2]]);
 *   for (const [key, value] of map) console.log(key, value);
 *   // 'a' 1, 'b' 2
 *
 * ARGUMENTS:
 *   function fn() {
 *     for (const arg of arguments) console.log(arg);
 *   }
 *
 * TYPED ARRAY:
 *   const uint8 = new Uint8Array([1, 2, 3]);
 *   for (const byte of uint8) console.log(byte);
 *
 * All use the same Iterator Protocol!
 */

/**
 * CUSTOM vs BUILT-IN COMPARISON:
 *
 * CUSTOM (1-3.js):
 * - Must implement iterator/iterable yourself
 * - Control exact iteration behavior
 * - Can create any sequence logic
 *
 * BUILT-IN (4.js):
 * - Already implemented
 * - Standard iteration behavior
 * - Just use the protocol
 *
 * WHEN TO IMPLEMENT CUSTOM:
 * ✅ Custom data structure (tree, graph, etc.)
 * ✅ Special iteration order (depth-first, breadth-first)
 * ✅ Lazy sequences (infinite, computed)
 * ✅ Filtering/transforming iteration
 *
 * WHEN TO USE BUILT-IN:
 * ✅ Standard collections (Array, Set, Map)
 * ✅ Standard iteration order
 * ✅ No special logic needed
 */

/**
 * ITERATOR PROTOCOL UNIVERSALITY:
 *
 * The beauty of Iterator Protocol:
 * Same interface for ALL collections!
 *
 * Code that works with iterables works with ANY iterable:
 *
 * function processAll(iterable) {
 *   for (const item of iterable) {
 *     process(item);
 *   }
 * }
 *
 * processAll([1, 2, 3]);           // Array
 * processAll(new Set([1, 2, 3]));  // Set
 * processAll(new Counter(0, 10));  // Custom
 * processAll(gen());                // Generator
 *
 * All work because they all implement Iterator Protocol!
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. BUILT-IN: Array, Set, Map, String already iterable
 * 2. SAME PROTOCOL: Use same Symbol.iterator approach
 * 3. NO IMPLEMENTATION: Don't reinvent the wheel
 * 4. UNIFORM INTERFACE: for-of works with all
 * 5. INTEROPERABLE: Custom and built-in work together
 *
 * PATTERN PROGRESSION:
 * - 1-2-3: Implement custom iterator/iterable
 * - 4 (this): Use built-in iterables
 * - 5-6: Generators (easiest for custom)
 *
 * The Iterator Pattern is FUNDAMENTAL to JavaScript!
 * Understanding it means understanding how all iteration works.
 *
 * NEXT FILES:
 * - 5-generator.js: Modern generator approach
 * - 6-yield.js: yield* delegation
 */
