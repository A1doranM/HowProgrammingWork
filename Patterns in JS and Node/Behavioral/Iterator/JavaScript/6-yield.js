'use strict';

/**
 * FILE PURPOSE: yield* Delegation - Delegating to Another Iterable
 *
 * This file demonstrates yield* (yield star) - a powerful feature
 * that delegates iteration to another iterable.
 *
 * yield* OPERATOR:
 * Delegates to another generator or iterable.
 * Yields all values from the delegated iterable.
 *
 * COMPARISON:
 *
 * WITHOUT yield* (manual):
 *   function* gen() {
 *     for (const value of [0, 1, 2]) {
 *       yield value;
 *     }
 *   }
 *
 * WITH yield* (automatic):
 *   function* gen() {
 *     yield* [0, 1, 2];
 *   }
 *
 * SAME RESULT, LESS CODE!
 *
 * USE CASES:
 * - Composing generators
 * - Flattening nested iterables
 * - Delegating to sub-generators
 * - Building iterator pipelines
 *
 * This is the SIMPLEST generator possible - just delegates to array!
 */

/**
 * Generator with yield* Delegation
 *
 * SYNTAX: yield* iterable
 *
 * WHAT yield* DOES:
 * 1. Gets iterator from iterable (calls Symbol.iterator)
 * 2. Calls next() on that iterator repeatedly
 * 3. Yields each value from delegated iterator
 * 4. Stops when delegated iterator is done
 *
 * EXECUTION MODEL:
 *
 * gen() called → returns generator object
 *   ↓
 * next() called on generator:
 *   ↓
 * 1. Execute: yield* [0, 1, 2]
 * 2. Get array's iterator: [0, 1, 2][Symbol.iterator]()
 * 3. Call iterator.next() → { value: 0, done: false }
 * 4. Yield that value from generator → { value: 0, done: false }
 *   ↓
 * next() called again:
 *   ↓
 * 5. Continue delegating
 * 6. Call iterator.next() → { value: 1, done: false }
 * 7. Yield that value → { value: 1, done: false }
 *   ↓
 * next() called again:
 *   ↓
 * 8. Continue delegating
 * 9. Call iterator.next() → { value: 2, done: false }
 * 10. Yield that value → { value: 2, done: false }
 *   ↓
 * next() called again:
 *   ↓
 * 11. Continue delegating
 * 12. Call iterator.next() → { value: undefined, done: true }
 * 13. Delegation done, generator done → { value: undefined, done: true }
 *
 * TRANSPARENT DELEGATION:
 * Generator transparently passes through delegated iterator's values.
 *
 * EQUIVALENT TO:
 *
 * function* gen() {
 *   const arr = [0, 1, 2];
 *   for (const value of arr) {
 *     yield value;
 *   }
 * }
 *
 * But yield* is more concise and performant!
 *
 * @returns {Generator} - Generator that yields 0, 1, 2
 */
const gen = function* () {
  /**
   * yield* delegates to array's iterator
   *
   * DELEGATION TARGET:
   * [0, 1, 2] is an iterable (arrays have Symbol.iterator).
   *
   * PROCESS:
   * - yield* gets array's iterator
   * - Yields each value: 0, then 1, then 2
   * - Generator done when array exhausted
   *
   * This is the SIMPLEST possible generator!
   * Just wraps an existing iterable.
   *
   * PRACTICAL USES:
   *
   * 1. Flattening:
   *    function* flatten(arr) {
   *      for (const item of arr) {
   *        if (Array.isArray(item)) yield* flatten(item);
   *        else yield item;
   *      }
   *    }
   *
   * 2. Combining generators:
   *    function* combined() {
   *      yield* gen1();
   *      yield* gen2();
   *      yield* gen3();
   *    }
   *
   * 3. Tree traversal:
   *    function* traverse(node) {
   *      yield node.value;
   *      for (const child of node.children) {
   *        yield* traverse(child);  // Recursive delegation
   *      }
   *    }
   */
  yield* [0, 1, 2];
};

// ===========================
// Usage: All Three Patterns (Same as 5-generator.js)
// ===========================

/**
 * Example 1: Manual iteration
 */
{
  const iterable = gen();
  const iterator = iterable[Symbol.iterator]();
  const step1 = iterator.next();
  const step2 = iterator.next();
  const step3 = iterator.next();
  const step4 = iterator.next();
  console.log({ step1, step2, step3, step4 });
  // Output: Same as all previous files
}

/**
 * Example 2: for-of loop
 */
{
  const iterable = gen();
  for (const step of iterable) {
    console.log({ step });
  }
  // Output: { step: 0 }, { step: 1 }, { step: 2 }
}

/**
 * Example 3: Spread operator
 */
{
  const iterable = gen();
  console.log({ steps: [...iterable] });
  // Output: { steps: [ 0, 1, 2 ] }
}

/**
 * yield vs yield* COMPARISON:
 *
 * YIELD (normal):
 *   function* gen() {
 *     yield [0, 1, 2];  // Yields the ARRAY itself
 *   }
 *   [...gen()]  // [[0, 1, 2]]  (array with one element)
 *
 * YIELD* (delegation):
 *   function* gen() {
 *     yield* [0, 1, 2];  // Yields each ELEMENT
 *   }
 *   [...gen()]  // [0, 1, 2]  (array with three elements)
 *
 * yield  → Yield single value
 * yield* → Yield all values from iterable
 */

/**
 * PRACTICAL yield* EXAMPLES:
 *
 * 1. COMBINING SEQUENCES:
 */
/*
function* numbers() {
  yield* [1, 2, 3];
  yield* [4, 5, 6];
  yield* [7, 8, 9];
}
[...numbers()]  // [1, 2, 3, 4, 5, 6, 7, 8, 9]
*/

/**
 * 2. RECURSIVE ITERATION:
 */
/*
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item);  // Recursive delegation
    } else {
      yield item;
    }
  }
}
[...flatten([1, [2, [3, 4]], 5])]  // [1, 2, 3, 4, 5]
*/

/**
 * 3. COMPOSING GENERATORS:
 */
/*
function* gen1() { yield 1; yield 2; }
function* gen2() { yield 3; yield 4; }
function* combined() {
  yield* gen1();  // Delegate to gen1
  yield* gen2();  // Delegate to gen2
}
[...combined()]  // [1, 2, 3, 4]
*/

/**
 * 4. TREE TRAVERSAL:
 */
/*
function* traverse(node) {
  yield node.value;
  for (const child of node.children) {
    yield* traverse(child);  // Recursive tree traversal
  }
}
*/

/**
 * KEY TAKEAWAYS:
 *
 * 1. yield*: Delegates to another iterable
 * 2. TRANSPARENT: Yields all values from delegated iterable
 * 3. CONCISE: Shorter than manual for-loop + yield
 * 4. COMPOSABLE: Build complex iterators from simple ones
 * 5. RECURSIVE: Can yield* to itself (tree traversal)
 *
 * PATTERN EVOLUTION COMPLETE:
 *
 * 1-iterator.js  → Basic iterator (manual state)
 * 2-iterable.js  → Iterable protocol (for-of works)
 * 3-class.js     → Class-based iterable
 * 4-array.js     → Built-in iterables
 * 5-generator.js → Generators (modern approach)
 * 6-yield.js     → ✅ yield* delegation (composition)
 *
 * RECOMMENDATION:
 * Use generators (function*) for all custom iteration.
 * Use yield* when composing or delegating.
 *
 * The Iterator Pattern in JavaScript is BEAUTIFULLY SIMPLE
 * thanks to generators!
 */
