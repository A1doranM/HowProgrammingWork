'use strict';

/**
 * FILE PURPOSE: Ultra-Compact Closure EventEmitter
 *
 * This file demonstrates the MOST COMPACT EventEmitter implementation
 * possible while remaining readable.
 *
 * EXTREME MINIMALISM:
 * - Entire EventEmitter in 2 lines (on, emit)
 * - Uses advanced JavaScript techniques
 * - Same functionality as 6-closure.js
 * - More terse, less verbose
 *
 * TECHNIQUES USED:
 * 1. Arrow functions (concise syntax)
 * 2. Default parameters (events = {})
 * 3. Object shorthand ({ on, emit })
 * 4. Inline expressions (no statement blocks)
 * 5. Chained array operations
 * 6. Comma operator (in on method)
 *
 * COMPARISON TO 6-closure.js:
 * - 6-closure.js: ~10 lines, easy to read
 * - 7-closure.js: 2 lines, compact but dense
 *
 * Same functionality, different code density!
 *
 * WHEN TO USE:
 * ✅ Code golf / minimization challenges
 * ✅ Understanding JavaScript features
 * ✅ Embedding in constraint environments
 *
 * WHEN NOT TO USE:
 * ❌ Production code (readability matters)
 * ❌ Team projects (maintainability)
 * ❌ Learning (too dense for beginners)
 */

/**
 * Ultra-Compact EventEmitter Factory
 *
 * BREAKDOWN OF COMPACT SYNTAX:
 *
 * emitter = (events = {}) => ({
 *   ^^^^^^^^
 *   Factory function with default parameter
 *
 * events = {}
 * ^^^^^^^^^^^
 * Default parameter - if not provided, use empty object
 * Allows: const ee = emitter() or const ee = emitter(existingEvents)
 *
 * => ({
 *    ^^^^
 *    Arrow function returning object literal
 *    Parentheses required: () => ({ key: value })
 *    Without parens: () => { } would be function body, not object
 *
 * @param {Object} events - Optional existing events object (default: {})
 * @returns {Object} - EventEmitter with on() and emit()
 *
 * ADVANCED TECHNIQUE: Default parameters as closure
 * The 'events' parameter becomes the private state via closure!
 */
const emitter = (events = {}) => ({
  /**
   * Register listener - ULTRA COMPACT VERSION
   *
   * BREAKDOWN:
   * on: (name, fn) => (events[name] = events[name] || []).push(fn)
   *
   * STEP BY STEP:
   *
   * 1. events[name] || []
   *    Get existing listener array or empty array
   *
   * 2. events[name] = ...
   *    Assign array to events[name]
   *    (If didn't exist, creates it)
   *
   * 3. (events[name] = ...).push(fn)
   *    Assignment returns the assigned value
   *    So we can immediately call .push() on it
   *
   * 4. Entire expression is the return value
   *    push() returns new length (not used, but that's OK)
   *
   * TRADITIONAL VERSION (6-closure.js):
   * on: (name, fn) => {
   *   const event = events[name];
   *   if (event) event.push(fn);
   *   else events[name] = [fn];
   * }
   *
   * COMPACT VERSION (this):
   * on: (name, fn) => (events[name] = events[name] || []).push(fn)
   *
   * SAME LOGIC:
   * - Get existing array or create new one
   * - Push fn to array
   * - Store in events[name]
   *
   * JAVASCRIPT TRICKS:
   *
   * 1. ASSIGNMENT AS EXPRESSION:
   *    (events[name] = array) returns array
   *    Can chain: (events[name] = []).push(fn)
   *
   * 2. SHORT-CIRCUIT OR:
   *    events[name] || []
   *    If events[name] exists, use it
   *    If undefined/null, use []
   *
   * 3. INLINE PUSH:
   *    No need for separate variable
   *    (array).push(fn) works directly
   *
   * WHY THIS WORKS:
   * JavaScript assignment returns assigned value:
   *   const x = (y = 5);  // y = 5, x = 5
   *   (arr = [1,2]).push(3);  // arr = [1,2,3], returns 3
   */
  on: (name, fn) => (events[name] = events[name] || []).push(fn),
  
  /**
   * Emit event - ULTRA COMPACT VERSION
   *
   * BREAKDOWN:
   * emit: (name, ...data) => (events[name] || []).forEach((fn) => fn(...data))
   *
   * STEP BY STEP:
   *
   * 1. events[name] || []
   *    Get listener array or empty array (safe even if no listeners)
   *
   * 2. .forEach((fn) => fn(...data))
   *    Call each listener with spread data
   *
   * 3. Entire expression is return value
   *    forEach returns undefined (not used)
   *
   * TRADITIONAL VERSION (6-closure.js):
   * emit: (name, ...data) => {
   *   const event = events[name];
   *   if (event) event.forEach((fn) => fn(...data));
   * }
   *
   * COMPACT VERSION (this):
   * emit: (name, ...data) => (events[name] || []).forEach((fn) => fn(...data))
   *
   * SAME LOGIC:
   * - Get listeners array (or empty)
   * - Call each with data
   *
   * SAFETY:
   * - If no listeners: empty array forEach = no-op
   * - No error thrown
   * - Safe to call even if event never registered
   *
   * SHORT-CIRCUIT EVALUATION:
   * events[name] || []
   *   If events[name] is undefined → use []
   *   [].forEach(...) → does nothing (safe!)
   */
  emit: (name, ...data) => (events[name] || []).forEach((fn) => fn(...data)),
});

// ===========================
// Usage (Same as 6-closure.js)
// ===========================

/**
 * Create emitter
 *
 * Same usage as 6-closure.js, just more compact implementation.
 */
const ee = emitter();

/**
 * Register listener
 */
ee.on('event1', (data) => {
  console.dir(data);
});

/**
 * Emit event
 *
 * OUTPUT: { a: 5 }
 */
ee.emit('event1', { a: 5 });

/**
 * CODE GOLF TECHNIQUES DEMONSTRATED:
 *
 * 1. ASSIGNMENT AS EXPRESSION:
 *    (x = value) returns value, allows chaining
 *
 * 2. DEFAULT PARAMETERS:
 *    (events = {}) provides default if not passed
 *
 * 3. ARROW FUNCTION IMPLICIT RETURN:
 *    (x) => x + 1  // No braces, returns x + 1
 *    (x) => ({ a: x })  // Parens needed for object literal
 *
 * 4. SHORT-CIRCUIT EVALUATION:
 *    events[name] || []  // Use existing or default
 *
 * 5. CHAINED OPERATIONS:
 *    (arr = []).push(x)  // Create and push in one expression
 *
 * 6. EXPRESSION METHODS:
 *    on: (a) => expr  // Method defined as arrow expression
 */

/**
 * COMPARING IMPLEMENTATIONS:
 *
 * EXPLICIT (6-closure.js):
 * on: (name, fn) => {
 *   const event = events[name];
 *   if (event) event.push(fn);
 *   else events[name] = [fn];
 * }
 *
 * COMPACT (this):
 * on: (name, fn) => (events[name] = events[name] || []).push(fn)
 *
 * READABILITY vs BREVITY:
 * - Explicit: Easy to understand, more lines
 * - Compact: Harder to parse, fewer lines
 *
 * PERFORMANCE:
 * Identical - JavaScript engine optimizes both the same way.
 *
 * MAINTAINABILITY:
 * Explicit version is more maintainable.
 * Compact version requires knowledge of JavaScript quirks.
 */

/**
 * WHEN THIS STYLE IS APPROPRIATE:
 *
 * ✅ Code challenges (minimize characters)
 * ✅ Learning JavaScript idioms
 * ✅ Understanding expressions vs statements
 * ✅ Embedded systems (minimize code size)
 *
 * WHEN TO AVOID:
 *
 * ❌ Production code (favor readability)
 * ❌ Team projects (harder to review)
 * ❌ Complex logic (would become unreadable)
 * ❌ Beginner-friendly code (too advanced)
 */

/**
 * EDUCATIONAL VALUE:
 *
 * This compact version teaches:
 *
 * 1. EXPRESSIONS ARE VALUES:
 *    Everything in JavaScript can be an expression
 *    Assignments, function calls, etc.
 *
 * 2. CHAINING:
 *    (expression).method().method()
 *    Each returns value for next operation
 *
 * 3. OPERATOR PRECEDENCE:
 *    (events[name] = ...).push(...)
 *    Parentheses control evaluation order
 *
 * 4. FUNCTIONAL STYLE:
 *    No statements, only expressions
 *    More mathematical, less imperative
 *
 * 5. ARROW FUNCTIONS:
 *    Implicit returns for single expressions
 *    Concise but powerful
 */

/**
 * ALTERNATIVE ULTRA-COMPACT:
 *
 * Even MORE compact (less readable):
 */
// const emitter = (e = {}) => ({
//   on: (n, f) => (e[n] = e[n] || []).push(f),
//   emit: (n, ...d) => (e[n] || []).map((f) => f(...d))
// });

/**
 * BREAKDOWN:
 * - e instead of events (1 char variable)
 * - n instead of name
 * - f instead of fn
 * - d instead of data
 * - map instead of forEach (same effect for void functions)
 *
 * EVEN MORE COMPACT (unreadable):
 */
// const emitter = (e = {}) => ({
//   on: (n, f) => ((e[n] = e[n] || []).push(f), e),
//   emit: (n, ...d) => (e[n] || []).map(f => f(...d))
// });

/**
 * Uses comma operator to return emitter instead of length.
 *
 * DON'T DO THIS IN PRODUCTION!
 * Shown only to understand JavaScript's flexibility.
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. COMPACT ≠ BETTER: Shorter code isn't always better code
 * 2. EXPRESSIONS: JavaScript allows expression-heavy style
 * 3. SAME PATTERN: Still EventEmitter, just different syntax
 * 4. LEARNING TOOL: Good for understanding JavaScript
 * 5. READABILITY MATTERS: Production code should be clear
 *
 * PROGRESSION:
 * - 1-simple.js: Traditional prototype (clear)
 * - 6-closure.js: Closure factory (balanced)
 * - 7-closure.js: Ultra-compact (dense)
 *
 * Each has its place!
 *
 * NEXT FILES:
 * - 8-methods.js: Full-featured API (practical)
 * - 9-min.js: Minified full-featured (compact + complete)
 * - b-class.js: Modern ES6 class (current best practice)
 */
