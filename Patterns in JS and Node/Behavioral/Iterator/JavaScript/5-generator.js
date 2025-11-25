'use strict';

/**
 * FILE PURPOSE: Generator Functions - Modern Iterator Pattern
 *
 * This file demonstrates GENERATORS - the modern, recommended way
 * to create iterators in JavaScript.
 *
 * GENERATOR ADVANTAGES:
 * ✅ Automatic iterator protocol implementation
 * ✅ Automatic iterable protocol implementation
 * ✅ Automatic state management
 * ✅ Simple syntax (function*)
 * ✅ Pause/resume execution (yield)
 * ✅ Less boilerplate
 *
 * COMPARISON:
 * - 1-iterator.js: Manual iterator (15 lines, no for-of)
 * - 2-iterable.js: Manual iterable (15 lines, for-of works)
 * - 5-generator.js (this): Generator (9 lines, everything works!)
 *
 * SAME FUNCTIONALITY, 40% LESS CODE!
 *
 * GENERATORS ARE:
 * - Both iterator AND iterable
 * - Self-implementing both protocols
 * - The standard way to create custom iterators
 *
 * THIS IS THE RECOMMENDED APPROACH for custom iteration!
 */

/**
 * Generator Function
 *
 * SYNTAX: function* name() { }
 * Note the asterisk (*) after function keyword.
 *
 * WHAT IS GENERATOR?
 * Special function that can pause and resume execution.
 *
 * CALLING GENERATOR:
 * gen() doesn't execute function body!
 * It returns a generator object (which is both iterator AND iterable).
 *
 * GENERATOR OBJECT:
 * {
 *   next(): { value, done },      // Iterator protocol
 *   [Symbol.iterator](): this      // Iterable protocol (returns itself)
 * }
 *
 * EXECUTION MODEL:
 * 1. Call gen() → returns generator object, function body NOT executed yet
 * 2. Call next() → executes until first yield
 * 3. yield pauses execution, returns value
 * 4. Call next() again → resumes from where it paused
 * 5. Repeat until return or end of function
 *
 * MAGICAL STATE MANAGEMENT:
 * JavaScript automatically saves/restores:
 * - Local variables
 * - Execution position
 * - Call stack
 *
 * No manual state tracking needed!
 *
 * @returns {Generator} - Generator object (iterator + iterable)
 */
const gen = function* () {
  /**
   * Generator state (automatically managed)
   *
   * LOCAL VARIABLE:
   * 'i' is a regular local variable.
   * But generator magic saves/restores it across yield calls!
   *
   * No need for closure tricks or this.counter.
   * Generator handles state management automatically.
   */
  let i = 0;
  
  /**
   * Infinite loop with yield
   *
   * CONTROL FLOW:
   * while (true) looks infinite, but:
   * - yield pauses execution
   * - return exits generator
   * - Generator can run forever or terminate
   *
   * EXECUTION TIMELINE:
   *
   * Call next():
   *   → Resume at last yield (or start)
   *   → Execute: i >= 3? No (i=0)
   *   → Execute: yield i++ (yield 0, i becomes 1)
   *   → Pause here
   *   → Return: { value: 0, done: false }
   *
   * Call next() again:
   *   → Resume after yield
   *   → Loop back to while
   *   → Execute: i >= 3? No (i=1)
   *   → Execute: yield i++ (yield 1, i becomes 2)
   *   → Pause here
   *   → Return: { value: 1, done: false }
   *
   * Call next() again:
   *   → Resume after yield
   *   → Loop back to while
   *   → Execute: i >= 3? No (i=2)
   *   → Execute: yield i++ (yield 2, i becomes 3)
   *   → Pause here
   *   → Return: { value: 2, done: false }
   *
   * Call next() again:
   *   → Resume after yield
   *   → Loop back to while
   *   → Execute: i >= 3? Yes (i=3)
   *   → Execute: return
   *   → Generator done
   *   → Return: { value: undefined, done: true }
   *
   * YIELD MAGIC:
   * - Pauses function execution
   * - Returns value to caller
   * - Saves all local state (variables, position)
   * - Resumes from exact point on next next() call
   *
   * This is what makes generators so powerful!
   */
  while (true) {
    if (i >= 3) return;  // Exit condition
    yield i++;            // Pause and return value
  }
};

// ===========================
// Usage Example 1: Manual Iteration
// ===========================

/**
 * Generator returns generator object
 *
 * IMPORTANT:
 * gen() doesn't execute the function!
 * It returns generator object that:
 * - Has next() method (iterator)
 * - Has [Symbol.iterator]() method (iterable)
 * - Will execute function body when next() called
 */
{
  const iterable = gen();  // Get generator object (nothing executed yet)
  
  /**
   * Get iterator (generator is its own iterator)
   *
   * GENERATOR SPECIAL PROPERTY:
   * Generator object[Symbol.iterator]() returns itself!
   *
   * So:
   *   const iter = iterable[Symbol.iterator]();
   *   iter === iterable  // true!
   *
   * Generator is BOTH iterator AND iterable.
   */
  const iterator = iterable[Symbol.iterator]();
  
  /**
   * Manual next() calls (same as previous files)
   *
   * Each next() call:
   * 1. Resumes generator execution
   * 2. Runs until yield or return
   * 3. Returns { value, done }
   */
  const step1 = iterator.next();  // Executes to first yield → { value: 0, done: false }
  const step2 = iterator.next();  // Resumes, executes to second yield → { value: 1, done: false }
  const step3 = iterator.next();  // Resumes, executes to third yield → { value: 2, done: false }
  const step4 = iterator.next();  // Resumes, hits return → { value: undefined, done: true }
  
  console.log({ step1, step2, step3, step4 });
  // Output: Same as 1-iterator.js and 2-iterable.js
  // But implemented with 60% less code!
}

// ===========================
// Usage Example 2: for-of Loop
// ===========================

/**
 * Use generator with for-of
 *
 * FRESH GENERATOR:
 * Each gen() call creates new generator instance.
 * This gen() is independent from the one above.
 *
 * AUTOMATIC ITERATION:
 * for-of calls next() automatically until done=true.
 */
{
  const iterable = gen();  // Fresh generator
  
  /**
   * for-of iteration
   *
   * GENERATOR BENEFIT:
   * Don't need to implement Symbol.iterator!
   * Generator does it automatically.
   *
   * EXECUTION:
   * Behind the scenes (what for-of does):
   * 1. const iterator = iterable[Symbol.iterator]();
   * 2. while (true) {
   *      const { value, done } = iterator.next();
   *      if (done) break;
   *      const step = value;
   *      console.log({ step });
   *    }
   *
   * OUTPUT:
   * { step: 0 }
   * { step: 1 }
   * { step: 2 }
   */
  for (const step of iterable) {
    console.log({ step });
  }
}

// ===========================
// Usage Example 3: Spread Operator
// ===========================

/**
 * Use generator with spread
 *
 * FRESH GENERATOR:
 * Yet another independent gen() call.
 *
 * SPREAD MAGIC:
 * Collects all yielded values into array.
 */
{
  const iterable = gen();  // Fresh generator
  
  /**
   * Spread into array
   *
   * GENERATOR BENEFIT:
   * Spread operator works automatically!
   * No special implementation needed.
   *
   * OUTPUT:
   * { steps: [ 0, 1, 2 ] }
   *
   * All values collected into array.
   */
  console.log({ steps: [...iterable] });
}

/**
 * GENERATOR vs MANUAL COMPARISON:
 *
 * MANUAL ITERABLE (2-iterable.js):
 * const iterable = {
 *   [Symbol.iterator]() {
 *     let i = 0;
 *     return {
 *       next() {
 *         return {
 *           value: i++,
 *           done: i > 3
 *         };
 *       }
 *     };
 *   }
 * };
 *
 * GENERATOR (this file):
 * function* gen() {
 *   let i = 0;
 *   while (i < 3) yield i++;
 * }
 *
 * SAME RESULT:
 * Both produce sequence [0, 1, 2]
 * Both work with for-of and spread
 *
 * DIFFERENCE:
 * Generator is much simpler and clearer!
 */

/**
 * GENERATOR BENEFITS DEMONSTRATED:
 *
 * 1. LESS CODE:
 *    ~5 lines vs ~15 lines for manual
 *
 * 2. AUTOMATIC PROTOCOLS:
 *    Iterator and Iterable protocols implemented automatically
 *
 * 3. NATURAL CONTROL FLOW:
 *    Use normal while, if, for loops
 *    No need to manually manage state
 *
 * 4. CLEARER INTENT:
 *    Code reads like: "yield values 0, 1, 2"
 *    vs manual: "return object with value and done properties"
 *
 * 5. STATEFUL:
 *    Local variables automatically preserved across yields
 *    No closure tricks needed
 *
 * 6. COMPOSABLE:
 *    Can yield* other generators
 *    Can use in generator pipelines
 */

/**
 * WHY GENERATORS ARE THE STANDARD:
 *
 * Before generators (ES5):
 * - Manual iterator objects
 * - Complex state management
 * - Lots of boilerplate
 *
 * After generators (ES6+):
 * - function* syntax
 * - yield keyword
 * - Automatic everything
 *
 * MODERN JAVASCRIPT:
 * Always use generators for custom iterators!
 *
 * EXCEPTIONS:
 * - Very simple cases (might not need function)
 * - Need to expose iterator interface differently
 * - Working with existing iterator code
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. GENERATOR: function* with yield
 * 2. AUTO-ITERATOR: Implements iterator protocol
 * 3. AUTO-ITERABLE: Implements iterable protocol
 * 4. YIELD: Pauses and returns value
 * 5. STATE: Automatically managed
 * 6. RECOMMENDED: Use generators for custom iteration
 *
 * PATTERN PROGRESSION:
 * - 1-iterator.js: Manual iterator
 * - 2-iterable.js: Manual iterable
 * - 5-generator.js: ✅ Generator (modern, recommended)
 *
 * NEXT FILE:
 * - 6-yield.js: yield* delegation
 */
