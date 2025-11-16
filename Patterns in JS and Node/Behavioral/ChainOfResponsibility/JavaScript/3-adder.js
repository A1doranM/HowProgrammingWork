'use strict';

/**
 * FILE PURPOSE: Type-Based Chain of Responsibility
 *
 * This file demonstrates a variant where handler selection is based on
 * the TYPE/CLASS of the request, using instanceof checks.
 *
 * DIFFERENCES FROM PREVIOUS FILES:
 * - 1-theory.js: Handler checks value content (typeof, Array.isArray)
 * - 2-simple.js: Same, but with functions
 * - 3-adder.js (this): Handler checks value TYPE (instanceof)
 *
 * USE CASE: Processing different collection types polymorphically
 *
 * PATTERN VARIANT: Type Dispatch Chain
 * - Each handler is associated with a specific type/class
 * - Handler selection via instanceof check
 * - Useful for polymorphic operations on different types
 *
 * REAL-WORLD EXAMPLES:
 * - File format handlers (PDF, DOCX, TXT)
 * - Protocol handlers (HTTP, HTTPS, FTP)
 * - Data structure converters (Array, Set, Map, etc.)
 */

/**
 * Adder Handler
 *
 * A handler that processes a specific type of collection.
 * Combines type checking with processing logic.
 *
 * STRUCTURE:
 *   Adder {
 *     type: Constructor,              // Type/class to match (Array, Set, etc.)
 *     reducer: (collection) => result, // Processing function
 *     next: Adder | null              // Link to next handler
 *   }
 *
 * DIFFERENCE FROM PREVIOUS IMPLEMENTATIONS:
 * - Previous: Handler decides based on value characteristics
 * - This: Handler decides based on value's type/class
 *
 * ADVANTAGES:
 * ✅ Clear separation: Each handler for one type
 * ✅ Type-safe: instanceof provides reliable type checking
 * ✅ Polymorphic: Same operation (reduce) on different types
 * ✅ Extensible: Easy to add new types
 */
class Adder {
  /**
   * Create a type-specific handler
   *
   * @param {Function} type - Constructor/class to match (Array, Set, Map, etc.)
   * @param {Function} reducer - Function to process this type
   *
   * EXAMPLE:
   *   new Adder(Array, (arr) => arr.reduce(sum))
   *   - Handles: Any Array instance
   *   - Process: Sum array elements
   *
   * TYPE MATCHING:
   *   collection instanceof type
   *   - [1,2,3] instanceof Array ✓
   *   - new Set() instanceof Set ✓
   *   - new Uint8Array() instanceof Uint8Array ✓
   */
  constructor(type, reducer) {
    this.type = type;        // Constructor to match against
    this.reducer = reducer;  // Processing function for this type
    this.next = null;        // Link to next handler
  }
}

/**
 * Type-Based Chain
 *
 * Manages a chain of type-specific handlers.
 * Traverses chain using instanceof checks instead of custom logic.
 *
 * KEY DIFFERENCE: Uses do-while loop instead of recursive step()
 * - Simpler for type-based dispatch
 * - No need for next() callback
 * - Handler doesn't decide - chain decides based on type
 */
class Chain {
  constructor() {
    this.first = null;  // Head of chain
    this.last = null;   // Tail of chain
  }

  /**
   * Add a type-specific handler to chain
   *
   * @param {Adder} adder - Handler for a specific type
   * @returns {Chain} - This for fluent API
   *
   * USAGE PATTERN:
   *   chain.add(new Adder(Array, arrayProcessor))
   *        .add(new Adder(Set, setProcessor))
   *        .add(new Adder(Map, mapProcessor));
   *
   * ORDER MATTERS:
   * - Put more specific types first
   * - More general types last (fallback)
   *
   * EXAMPLE OF ORDER IMPORTANCE:
   *   Uint8Array extends TypedArray extends Object
   *
   *   ✅ Correct order:
   *     .add(Uint8Array handler)  // Most specific
   *     .add(Object handler)      // Most general
   *
   *   ❌ Wrong order:
   *     .add(Object handler)      // Matches everything!
   *     .add(Uint8Array handler)  // Never reached
   */
  add(adder) {
    // Same linking logic as previous files
    if (!this.first) this.first = adder;
    else this.last.next = adder;
    this.last = adder;
    return this;
  }

  /**
   * Process collection by finding matching type handler
   *
   * @param {any} collection - Collection to process
   * @returns {any} - Result from the handler that matches type
   * @throws {Error} - If no handler matches the collection type
   *
   * TRAVERSAL METHOD: do-while loop (not recursive)
   *
   * WHY do-while INSTEAD OF RECURSION?
   * - Type checking is synchronous and simple
   * - No need for next() callback complexity
   * - More straightforward for type dispatch
   * - Better performance (no function calls)
   *
   * EXECUTION FLOW for process([1, 2, 3]):
   *
   * 1. adder = ArrayAdder
   * 2. Check: [1,2,3] instanceof Array ✓
   * 3. Execute: arrayReducer([1,2,3])
   * 4. Return: 6
   * 5. Chain stops
   *
   * EXECUTION FLOW for process(new Set([1, 2, 3])):
   *
   * 1. adder = ArrayAdder
   * 2. Check: Set instanceof Array ✗
   * 3. adder = SetAdder
   * 4. Check: Set instanceof Set ✓
   * 5. Execute: setReducer(Set)
   * 6. Return: 6
   * 7. Chain stops
   */
  process(collection) {
    let adder = this.first;
    
    // Traverse chain until type matches
    do {
      // Check if collection is an instance of this handler's type
      if (collection instanceof adder.type) {
        // Type matches! Process with this handler's reducer
        return adder.reducer(collection);
      }
      // Type doesn't match, try next handler
      adder = adder.next;
    } while (adder);  // Continue until end of chain
    
    // No handler matched the type
    throw new Error('Unsupported collection type');
  }
}

// ===========================
// Usage Examples
// ===========================

/**
 * Helper function: Sum two numbers
 * Used by all reducers to sum collection elements
 */
const sum = (a, b) => a + b;

/**
 * Build a chain that handles different collection types
 *
 * CHAIN STRUCTURE:
 *   ArrayAdder → SetAdder → Uint8ArrayAdder → ObjectAdder → null
 *
 * Each handler:
 * 1. Matches a specific type
 * 2. Knows how to convert that type to summable form
 * 3. Applies sum reduction
 *
 * ORDER SIGNIFICANCE:
 * - Array, Set, Uint8Array are checked first (specific types)
 * - Object is last (catches everything else as fallback)
 */
const chain = new Chain()
  /**
   * Handler 1: Array Handler
   *
   * Type: Array
   * Process: Direct reduce (arrays are already iterable)
   *
   * Matches: [1, 2, 3], new Array(1, 2, 3)
   */
  .add(new Adder(Array, (array) => array.reduce(sum)))
  
  /**
   * Handler 2: Set Handler
   *
   * Type: Set
   * Process: Convert Set to Array via spread, then reduce
   *
   * Matches: new Set([1, 2, 3])
   *
   * WHY CONVERT TO ARRAY?
   * Sets don't have reduce() method, but are iterable.
   * Spread operator [...set] converts to array.
   */
  .add(new Adder(Set, (set) => [...set].reduce(sum)))
  
  /**
   * Handler 3: Uint8Array Handler
   *
   * Type: Uint8Array (Typed Array)
   * Process: Convert to regular Array, then reduce
   *
   * Matches: new Uint8Array([1, 2, 3])
   *
   * WHY Array.from()?
   * Typed arrays are array-like but not regular arrays.
   * Array.from() creates a real array with reduce() method.
   */
  .add(new Adder(Uint8Array, (u8a) => Array.from(u8a).reduce(sum)))
  
  /**
   * Handler 4: Object Handler (Fallback)
   *
   * Type: Object (catches everything else)
   * Process: Return error message
   *
   * Matches: Plain objects, Int32Array, custom classes, etc.
   *
   * PURPOSE: Fallback handler to prevent throwing error
   * Alternative: Could actually sum object values:
   *   Object.values(obj).reduce(sum)
   *
   * IMPORTANT: Object is base of all types in JavaScript
   * - Everything (except null/undefined) instanceof Object
   * - Must be LAST in chain or it catches everything
   */
  .add(new Adder(Object, (obj) => `Not supported ${obj.constructor.name}`));

/**
 * Example 1: Process Array
 *
 * Flow:
 * chain.process([1, 2, 3])
 *   → Check: [1,2,3] instanceof Array ✓
 *   → Execute: [1,2,3].reduce(sum)
 *   → Result: 6
 *
 * Output: { sum1: 6 }
 */
const sum1 = chain.process([1, 2, 3]);
console.dir({ sum1 });
// Output: { sum1: 6 }

/**
 * Example 2: Process Set
 *
 * Flow:
 * chain.process(new Set([1, 2, 3]))
 *   → Check: Set instanceof Array ✗
 *   → Check: Set instanceof Set ✓
 *   → Execute: [...Set].reduce(sum)
 *   → Result: 6
 *
 * Output: { sum2: 6 }
 */
const sum2 = chain.process(new Set([1, 2, 3]));
console.dir({ sum2 });
// Output: { sum2: 6 }

/**
 * Example 3: Process Uint8Array
 *
 * Flow:
 * chain.process(new Uint8Array([1, 2, 3]))
 *   → Check: Uint8Array instanceof Array ✗
 *   → Check: Uint8Array instanceof Set ✗
 *   → Check: Uint8Array instanceof Uint8Array ✓
 *   → Execute: Array.from(Uint8Array).reduce(sum)
 *   → Result: 6
 *
 * Output: { sum3: 6 }
 */
const sum3 = chain.process(new Uint8Array([1, 2, 3]));
console.dir({ sum3 });
// Output: { sum3: 6 }

/**
 * Example 4: Process Int32Array (No specific handler)
 *
 * Flow:
 * chain.process(new Int32Array([1, 2, 3]))
 *   → Check: Int32Array instanceof Array ✗
 *   → Check: Int32Array instanceof Set ✗
 *   → Check: Int32Array instanceof Uint8Array ✗
 *   → Check: Int32Array instanceof Object ✓ (everything is)
 *   → Execute: return "Not supported Int32Array"
 *
 * Output: { sum4: "Not supported Int32Array" }
 *
 * NOTE: Int32Array has no specific handler, falls back to Object handler
 */
const sum4 = chain.process(new Int32Array([1, 2, 3]));
console.dir({ sum4 });
// Output: { sum4: "Not supported Int32Array" }

/**
 * TYPE HIERARCHY IN JAVASCRIPT:
 *
 *   Object (base type)
 *   ├── Array
 *   ├── Set
 *   ├── Map
 *   ├── TypedArray
 *   │   ├── Uint8Array
 *   │   ├── Int32Array
 *   │   ├── Float64Array
 *   │   └── ...
 *   └── Custom Classes
 *
 * HANDLER ORDER STRATEGY:
 * 1. Most specific types first (Uint8Array, Int32Array)
 * 2. General types next (Array, Set)
 * 3. Base type last (Object) as fallback
 */

/**
 * EXTENDING THE CHAIN:
 *
 * Add more type handlers easily:
 */

// Handle Map type
// chain.add(new Adder(Map, (map) =>
//   [...map.values()].reduce(sum)
// ));

// Handle custom class
// class NumberCollection {
//   constructor(numbers) { this.numbers = numbers; }
// }
// chain.add(new Adder(NumberCollection, (nc) =>
//   nc.numbers.reduce(sum)
// ));

/**
 * REAL-WORLD APPLICATIONS:
 *
 * 1. FILE FORMAT HANDLERS:
 */
// const fileChain = new Chain()
//   .add(new Handler(PDFFile, (pdf) => pdf.extractText()))
//   .add(new Handler(WordFile, (doc) => doc.getText()))
//   .add(new Handler(TextFile, (txt) => txt.read()));

/**
 * 2. SERIALIZATION HANDLERS:
 */
// const serializerChain = new Chain()
//   .add(new Handler(Date, (date) => date.toISOString()))
//   .add(new Handler(RegExp, (regex) => regex.source))
//   .add(new Handler(Map, (map) => Object.fromEntries(map)))
//   .add(new Handler(Set, (set) => [...set]))
//   .add(new Handler(Object, (obj) => JSON.stringify(obj)));

/**
 * 3. VALIDATION HANDLERS:
 */
// const validatorChain = new Chain()
//   .add(new Validator(Email, validateEmail))
//   .add(new Validator(Phone, validatePhone))
//   .add(new Validator(URL, validateURL))
//   .add(new Validator(String, validateString));

/**
 * ADVANTAGES OF TYPE-BASED DISPATCH:
 *
 * ✅ Clear intent: Each handler explicitly for one type
 * ✅ Type safety: instanceof is reliable and built-in
 * ✅ Polymorphism: Same operation on different types
 * ✅ Extensible: Add new types without modifying existing
 * ✅ Maintainable: Easy to see which types are handled
 * ✅ Performant: instanceof is fast native operation
 *
 * COMPARISON TO OTHER APPROACHES:
 *
 * vs typeof checks:
 *   - instanceof: Works with classes and inheritance
 *   - typeof: Only primitive types (number, string, etc.)
 *
 * vs duck typing:
 *   - instanceof: Explicit type checking
 *   - duck typing: Check for methods/properties
 *
 * vs type field:
 *   - instanceof: Native JavaScript feature
 *   - type field: Manual type annotation
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. TYPE-BASED SELECTION: Handler chosen by value's type/class
 * 2. INSTANCEOF CHECK: Native JavaScript type checking
 * 3. POLYMORPHIC OPERATIONS: Same operation on different types
 * 4. ORDER MATTERS: Specific types before general types
 * 5. FALLBACK HANDLER: Object catches everything else
 * 6. DO-WHILE LOOP: Simpler than recursion for type checking
 * 7. EXTENSIBLE: Easy to add new type handlers
 *
 * WHEN TO USE THIS VARIANT:
 * ✅ Processing different types polymorphically
 * ✅ Type-specific operations (serialization, validation)
 * ✅ Plugin systems with type-based dispatch
 * ✅ File/protocol handlers
 * ✅ When instanceof provides natural selection criteria
 *
 * PATTERN EVOLUTION:
 * 1-theory.js:  Abstract + Concrete classes (OOP)
 * 2-simple.js:  Function-based handlers (Functional)
 * 3-adder.js:   Type-based dispatch (Polymorphic)
 * 4-server.js:  Real-world HTTP middleware (Practical)
 */
