'use strict';

/**
 * FILE PURPOSE: Classical GoF Chain of Responsibility Pattern
 *
 * This file demonstrates the traditional Gang of Four implementation with:
 * - Abstract base class defining the handler interface
 * - Concrete handlers extending the abstract class
 * - Chain manager (Sender) to build and traverse the chain
 *
 * PATTERN STRUCTURE:
 *   Request → Sender → Handler1 → Handler2 → ... → HandlerN
 *              (Chain)   |          |              |
 *                        ↓          ↓              ↓
 *                     Process?   Process?      Process?
 *                     or Pass    or Pass       or Throw
 *
 * This is the most formal implementation, closest to the original pattern.
 */

/**
 * Abstract Handler Base Class
 *
 * Defines the interface that all concrete handlers must follow.
 * In classical OOP, this would be an abstract class or interface.
 *
 * JavaScript doesn't have true abstract classes, so we simulate it
 * by checking if the constructor is being called directly.
 *
 * RESPONSIBILITIES:
 * 1. Define the handler interface (method signature)
 * 2. Maintain reference to next handler in chain
 * 3. Prevent direct instantiation (abstract class pattern)
 */
class AbstractHandler {
  constructor() {
    // Check if this class is being instantiated directly (not allowed)
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === AbstractHandler) {
      throw new Error('Abstract class should not be instanciated');
    }
    
    // Reference to the next handler in the chain
    // Null means this is the last handler
    this.next = null;
  }

  /**
   * Abstract method that concrete handlers must implement
   *
   * This is the processing method that each handler must override.
   * Throwing an error ensures subclasses implement this method.
   *
   * @param {any} value - The request to process
   * @throws {Error} If not implemented by subclass
   */
  method(value) {
    const s = JSON.stringify({ method1: { value } });
    throw new Error('Method is not implemented: ' + s);
  }
}

/**
 * Concrete Handler: Number Handler
 *
 * Specializes in processing numeric values.
 * This handler demonstrates the core Chain of Responsibility logic:
 * 1. Check if it can handle the request
 * 2. If yes, process and return result
 * 3. If no, pass to next handler via next() callback
 *
 * GRASP PRINCIPLES:
 * - Information Expert: Has knowledge to detect numbers
 * - Single Responsibility: Only handles numbers
 * - Low Coupling: Doesn't know about other handlers
 */
class NumberHandler extends AbstractHandler {
  /**
   * Process numeric values by converting to string
   *
   * @param {any} value - The value to process
   * @param {Function} next - Callback to pass request to next handler
   * @returns {string} - String representation if number, otherwise next()
   *
   * EXECUTION FLOW:
   * - Input: 42
   * - Check: typeof 42 === 'number' ✓
   * - Process: 42.toString() → "42"
   * - Return: "42" (chain stops here)
   */
  method(value, next) {
    // Check if this handler can process the value
    if (typeof value === 'number') {
      // Handler processes the request
      return value.toString();
    }
    // Can't handle, pass to next handler
    return next();
  }
}

/**
 * Concrete Handler: Array Handler
 *
 * Specializes in processing array values.
 * Demonstrates same pattern as NumberHandler but for arrays.
 *
 * RESPONSIBILITY: Sum array elements
 */
class ArrayHandler extends AbstractHandler {
  /**
   * Process arrays by summing elements
   *
   * @param {any} value - The value to process
   * @param {Function} next - Callback to pass request to next handler
   * @returns {number} - Sum if array, otherwise next()
   *
   * EXECUTION FLOW:
   * - Input: [1, 2, 3]
   * - Check: Array.isArray([1, 2, 3]) ✓
   * - Process: [1, 2, 3].reduce((a, b) => a + b) → 6
   * - Return: 6 (chain stops here)
   */
  method(value, next) {
    // Check if this handler can process the value
    if (Array.isArray(value)) {
      // Handler processes the request: sum all elements
      return value.reduce((a, b) => a + b);
    }
    // Can't handle, pass to next handler
    return next();
  }
}

/**
 * Chain Manager (Sender)
 *
 * Manages the chain of handlers and processes requests.
 *
 * RESPONSIBILITIES:
 * 1. Build the chain by linking handlers
 * 2. Process requests by traversing the chain
 * 3. Provide fluent API for adding handlers
 *
 * DESIGN PATTERN: Builder (fluent API) + Chain of Responsibility
 *
 * INTERNAL STRUCTURE:
 *   Sender
 *   ├── first: Handler1 ──→ next: Handler2 ──→ next: null
 *   └── last:  Handler2 (for efficient appending)
 */
class Sender {
  constructor() {
    this.first = null;  // Start of chain (head)
    this.last = null;   // End of chain (tail) - optimization for O(1) append
  }

  /**
   * Add a handler to the end of the chain
   *
   * This method builds the chain by linking handlers together.
   * Uses 'last' reference for O(1) appending (instead of O(n) traversal).
   *
   * @param {AbstractHandler} handler - Handler to add to chain
   * @returns {Sender} - Returns this for method chaining (fluent API)
   *
   * CHAIN BUILDING EXAMPLE:
   *
   * Step 1: add(NumberHandler)
   *   first: NumberHandler, last: NumberHandler
   *   NumberHandler.next = null
   *
   * Step 2: add(ArrayHandler)
   *   first: NumberHandler, last: ArrayHandler
   *   NumberHandler.next = ArrayHandler
   *   ArrayHandler.next = null
   *
   * Result:
   *   NumberHandler → ArrayHandler → null
   */
  add(handler) {
    if (!this.first) {
      // First handler in chain
      this.first = handler;
    } else {
      // Link previous last handler to new handler
      this.last.next = handler;
    }
    // Update last to point to new handler
    this.last = handler;
    
    // Return this for method chaining: sender.add(h1).add(h2).add(h3)
    return this;
  }

  /**
   * Process a request by traversing the chain
   *
   * This is the core Chain of Responsibility logic.
   * Traverses handlers until one processes the request.
   *
   * @param {any} value - The request to process
   * @returns {string} - Result from the handler that processed the request
   * @throws {Error} - If no handler in chain can process the request
   *
   * EXECUTION FLOW for process(100):
   *
   * 1. current = NumberHandler
   * 2. Call NumberHandler.method(100, next)
   * 3. NumberHandler checks: typeof 100 === 'number' ✓
   * 4. NumberHandler returns "100"
   * 5. Chain stops, result returned
   *
   * EXECUTION FLOW for process([1,2,3]):
   *
   * 1. current = NumberHandler
   * 2. Call NumberHandler.method([1,2,3], next)
   * 3. NumberHandler checks: typeof [1,2,3] === 'number' ✗
   * 4. NumberHandler calls next()
   * 5. current = ArrayHandler
   * 6. Call ArrayHandler.method([1,2,3], next)
   * 7. ArrayHandler checks: Array.isArray([1,2,3]) ✓
   * 8. ArrayHandler returns 6
   * 9. Chain stops, result returned
   *
   * RECURSIVE IMPLEMENTATION:
   * Uses recursion via step() function to traverse chain.
   * Each handler gets a next() callback that advances to next handler.
   */
  process(value) {
    let current = this.first;
    
    /**
     * Recursive step function to traverse chain
     *
     * This closure captures 'current' and provides the next() callback
     * that each handler uses to pass the request to the next handler.
     *
     * WHY RECURSION?
     * - Clean separation: Each handler decides when to call next()
     * - Flexibility: Handler can process and then call next() (logging)
     * - Natural: Matches the conceptual model of passing along a chain
     */
    const step = () =>
      current.method(value, () => {
        // next() callback implementation
        current = current.next;  // Move to next handler
        if (current) return step();  // Continue if more handlers
        throw new Error('No handler detected');  // End of chain, none handled
      });
    
    // Start chain traversal
    return step().toString();
  }
}

// ===========================
// Usage Examples
// ===========================

/**
 * Build a chain with NumberHandler and ArrayHandler
 *
 * Chain structure:
 *   NumberHandler → ArrayHandler → null
 *
 * Processing order:
 * 1. Request arrives at Sender
 * 2. Sender calls NumberHandler first
 * 3. If NumberHandler can't handle, it calls next() → ArrayHandler
 * 4. If ArrayHandler can't handle, it calls next() → Error thrown
 */
const sender = new Sender()
  .add(new NumberHandler())  // First handler
  .add(new ArrayHandler());  // Second handler

/**
 * Example 1: Process a number
 *
 * Flow:
 * sender.process(100)
 *   → NumberHandler.method(100, next)
 *   → typeof 100 === 'number' ✓
 *   → return "100"
 *
 * Result: { result: "100" }
 */
{
  const result = sender.process(100);
  console.dir({ result });
  // Output: { result: "100" }
}

/**
 * Example 2: Process an array
 *
 * Flow:
 * sender.process([1, 2, 3])
 *   → NumberHandler.method([1,2,3], next)
 *   → typeof [1,2,3] === 'number' ✗
 *   → return next()
 *   → ArrayHandler.method([1,2,3], next)
 *   → Array.isArray([1,2,3]) ✓
 *   → return [1,2,3].reduce((a,b) => a+b) = 6
 *
 * Result: { result: "6" }
 */
{
  const result = sender.process([1, 2, 3]);
  console.dir({ result });
  // Output: { result: "6" }
}

/**
 * What happens with unsupported types?
 *
 * sender.process("hello")
 *   → NumberHandler: typeof "hello" === 'number' ✗ → next()
 *   → ArrayHandler: Array.isArray("hello") ✗ → next()
 *   → current.next is null → Error: 'No handler detected'
 *
 * To handle this, you could add a DefaultHandler:
 *   .add(new DefaultHandler())  // Handles everything else
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. ABSTRACT BASE CLASS: Defines handler interface, prevents instantiation
 * 2. CONCRETE HANDLERS: Each handles specific type, passes if can't handle
 * 3. CHAIN BUILDING: Sender links handlers via 'next' references
 * 4. CHAIN TRAVERSAL: Recursively calls handlers until one processes
 * 5. SEPARATION OF CONCERNS: Each handler only knows its responsibility
 * 6. OPEN/CLOSED: Easy to add new handlers without modifying existing code
 * 7. FLUENT API: Method chaining makes chain building readable
 *
 * BENEFITS:
 * ✅ Decoupling: Sender doesn't know which handler processes
 * ✅ Flexibility: Easy to add/remove/reorder handlers
 * ✅ Single Responsibility: Each handler has one job
 * ✅ Testability: Each handler can be tested independently
 *
 * COMPARISON TO NEXT FILES:
 * - 2-simple.js: Functional approach (less boilerplate)
 * - 3-adder.js: Type-based dispatch variant
 * - 4-server.js: Real-world HTTP middleware application
 */
