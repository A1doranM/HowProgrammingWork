'use strict';

/**
 * FILE PURPOSE: Simplified Functional Chain of Responsibility
 *
 * This file demonstrates a more JavaScript-idiomatic approach:
 * - No abstract classes or inheritance
 * - Functions as handlers (first-class citizens)
 * - Less boilerplate, more flexible
 * - Same pattern benefits with simpler code
 *
 * COMPARISON TO 1-theory.js:
 * - 1-theory.js: Abstract class + concrete handlers (OOP)
 * - 2-simple.js: Function-based handlers (Functional)
 *
 * ADVANTAGES:
 * ✅ Less code (no abstract class, no inheritance)
 * ✅ More flexible (ad-hoc handlers)
 * ✅ More JavaScript-idiomatic (functions as values)
 * ✅ Easier to create one-off handlers inline
 *
 * DISADVANTAGES:
 * ❌ No type safety through inheritance
 * ❌ No enforced handler interface
 * ❌ Handlers are anonymous (harder to debug)
 */

/**
 * Handler Wrapper Class
 *
 * Simple wrapper that holds a handler function and reference to next handler.
 * Much simpler than AbstractHandler - just stores the function and link.
 *
 * STRUCTURE:
 *   Handler {
 *     fn: (value, next) => result,  // The actual handler logic
 *     next: Handler | null           // Link to next handler
 *   }
 *
 * This is essentially a linked list node where:
 * - data = handler function
 * - next = next node
 */
class Handler {
  /**
   * Create a handler wrapper
   *
   * @param {Function} fn - Handler function (value, next) => result
   *
   * HANDLER FUNCTION SIGNATURE:
   *   (value: any, next: () => any) => any
   *
   * - value: The request to handle
   * - next: Callback to pass request to next handler
   * - return: Result if handled, or next() if not
   */
  constructor(fn) {
    this.fn = fn;      // Store the handler function
    this.next = null;  // Will be linked to next handler
  }
}

/**
 * Chain Manager (Sender)
 *
 * Same as 1-theory.js but accepts functions instead of handler objects.
 * Internally wraps functions in Handler objects for linking.
 *
 * KEY DIFFERENCE: add() accepts a function, not a Handler object
 */
class Sender {
  constructor() {
    this.first = null;  // Head of chain
    this.last = null;   // Tail of chain
  }

  /**
   * Add a handler function to the chain
   *
   * This is where the simplification happens:
   * - User passes a function
   * - We wrap it in a Handler object internally
   * - User doesn't need to create Handler objects
   *
   * @param {Function} fn - Handler function (value, next) => result
   * @returns {Sender} - This for method chaining
   *
   * USAGE COMPARISON:
   *
   * OOP (1-theory.js):
   *   sender.add(new NumberHandler())  // Must create instance
   *
   * Functional (this file):
   *   sender.add((value, next) => { ... })  // Just pass function
   */
  add(fn) {
    // Wrap function in Handler object (internal implementation detail)
    const handler = new Handler(fn);
    
    // Same linking logic as 1-theory.js
    if (!this.first) {
      this.first = handler;
    } else {
      this.last.next = handler;
    }
    this.last = handler;
    
    return this;  // Fluent API
  }

  /**
   * Process a request through the chain
   *
   * Identical to 1-theory.js except calls handler.fn instead of handler.method
   *
   * @param {any} value - Request to process
   * @returns {string} - Result from handler that processed request
   * @throws {Error} - If no handler can process
   */
  process(value) {
    let current = this.first;
    
    /**
     * Recursive traversal (same as 1-theory.js)
     *
     * Each handler receives:
     * - value: The request
     * - next: Callback to advance to next handler
     */
    const step = () =>
      current.fn(value, () => {  // Call handler function (not handler.method)
        current = current.next;
        if (current) return step();
        throw new Error('No handler detected');
      });
    
    return step().toString();
  }
}

// ===========================
// Usage Examples
// ===========================

/**
 * Build chain with inline handler functions
 *
 * NOTICE: No need to create handler classes!
 * Functions are defined inline, making the code more concise.
 *
 * This is the beauty of first-class functions in JavaScript.
 */
const sender = new Sender()
  /**
   * Handler 1: Number Handler (inline function)
   *
   * Same logic as NumberHandler from 1-theory.js,
   * but as a simple function instead of a class.
   *
   * HANDLER SIGNATURE:
   * (value, next) => result | next()
   *
   * @param {any} value - Value to check
   * @param {Function} next - Callback to next handler
   * @returns {string} - String if number, otherwise next()
   */
  .add((value, next) => {
    // Check if this handler can process
    if (typeof value === 'number') {
      return value.toString();  // Handle request
    }
    return next();  // Pass to next handler
  })
  
  /**
   * Handler 2: Array Handler (inline function)
   *
   * Same logic as ArrayHandler from 1-theory.js,
   * as a simple function.
   *
   * @param {any} value - Value to check
   * @param {Function} next - Callback to next handler
   * @returns {number} - Sum if array, otherwise next()
   */
  .add((value, next) => {
    // Check if this handler can process
    if (Array.isArray(value)) {
      return value.reduce((a, b) => a + b);  // Handle request
    }
    return next();  // Pass to next handler
  });

/**
 * Example 1: Process number
 *
 * Flow (same as 1-theory.js):
 * sender.process(100)
 *   → Handler1(100, next)
 *   → typeof 100 === 'number' ✓
 *   → return "100"
 */
{
  const result = sender.process(100);
  console.dir({ result });
  // Output: { result: "100" }
}

/**
 * Example 2: Process array
 *
 * Flow (same as 1-theory.js):
 * sender.process([1,2,3])
 *   → Handler1([1,2,3], next)
 *   → typeof [1,2,3] === 'number' ✗
 *   → return next()
 *   → Handler2([1,2,3], next)
 *   → Array.isArray([1,2,3]) ✓
 *   → return 6
 */
{
  const result = sender.process([1, 2, 3]);
  console.dir({ result });
  // Output: { result: "6" }
}

/**
 * FUNCTIONAL ADVANTAGES:
 *
 * 1. LESS BOILERPLATE:
 *    No need to define NumberHandler, ArrayHandler classes
 *    Just write the logic directly
 *
 * 2. AD-HOC HANDLERS:
 *    Easy to add one-off handlers without creating classes
 *    Perfect for specific use cases
 *
 * 3. CLOSURES:
 *    Handler functions can close over variables:
 *
 *    const threshold = 10;
 *    sender.add((value, next) => {
 *      if (value > threshold) return 'high';
 *      return next();
 *    });
 *
 * 4. REUSABLE FUNCTIONS:
 *    Can define handler functions separately and reuse:
 *
 *    const numberHandler = (value, next) => {
 *      if (typeof value === 'number') return value.toString();
 *      return next();
 *    };
 *
 *    chain1.add(numberHandler);
 *    chain2.add(numberHandler);  // Reuse same function
 *
 * 5. COMPOSABILITY:
 *    Can create handler factories:
 *
 *    const typeHandler = (type, process) => (value, next) => {
 *      if (typeof value === type) return process(value);
 *      return next();
 *    };
 *
 *    sender.add(typeHandler('number', v => v.toString()))
 *          .add(typeHandler('string', v => v.toUpperCase()));
 */

/**
 * WHEN TO USE THIS APPROACH:
 *
 * ✅ Rapid prototyping
 * ✅ Simple handlers that don't need classes
 * ✅ One-off handlers specific to a use case
 * ✅ When working with functional programming style
 * ✅ When you want less boilerplate
 *
 * WHEN TO USE OOP APPROACH (1-theory.js):
 *
 * ✅ Need type safety and interfaces
 * ✅ Handlers are complex with state
 * ✅ Want to enforce handler contract
 * ✅ Team prefers OOP style
 * ✅ Need to debug specific handler classes
 */

/**
 * ADVANCED FUNCTIONAL PATTERNS:
 *
 * 1. HIGHER-ORDER HANDLER FACTORIES:
 */

// Factory for type-checking handlers
const createTypeHandler = (type, process) => (value, next) => {
  if (typeof value === type) return process(value);
  return next();
};

// Usage:
// sender.add(createTypeHandler('number', v => v.toString()))
//       .add(createTypeHandler('boolean', v => v ? 'yes' : 'no'));

/**
 * 2. CONDITIONAL HANDLER WRAPPING:
 */

// Wrap handler with pre/post conditions
const withLogging = (handler) => (value, next) => {
  console.log('Before:', value);
  const result = handler(value, next);
  console.log('After:', result);
  return result;
};

// Usage:
// sender.add(withLogging((value, next) => {
//   // handler logic
// }));

/**
 * 3. ASYNC HANDLER SUPPORT:
 */

// For async operations, modify step() to await:
// const step = async () =>
//   await current.fn(value, async () => {
//     current = current.next;
//     if (current) return await step();
//     throw new Error('No handler detected');
//   });

/**
 * KEY TAKEAWAYS:
 *
 * 1. FUNCTIONS AS HANDLERS: First-class functions enable simpler pattern
 * 2. SAME BENEFITS: All Chain of Responsibility benefits remain
 * 3. LESS CODE: No abstract classes, inheritance, or boilerplate
 * 4. MORE FLEXIBLE: Easy to create handlers on-the-fly
 * 5. JAVASCRIPT-IDIOMATIC: Leverages language strengths
 * 6. PRACTICAL: Perfect for real-world JavaScript applications
 *
 * PATTERN ESSENCE UNCHANGED:
 * - Request flows through chain
 * - Each handler checks if it can handle
 * - First matching handler processes
 * - Easy to add/remove/reorder handlers
 *
 * COMPARISON SUMMARY:
 *
 * OOP (1-theory.js):     class → extends → new → add
 * Functional (this):     function → add
 *
 * Same pattern, different style. Choose based on your needs!
 */
