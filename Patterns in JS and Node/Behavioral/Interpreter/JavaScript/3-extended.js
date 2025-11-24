'use strict';

/**
 * FILE PURPOSE: Extended Interpreter - Lisp-like Operations
 *
 * This file extends 2-improved.js with additional operators inspired by Lisp:
 * - eq: Equality comparison
 * - list: Create lists
 * - car: Get first element (head)
 * - cdr: Get rest of list (tail)
 *
 * NEW FEATURES:
 * ✅ Boolean operations (comparison)
 * ✅ List operations (Lisp car/cdr)
 * ✅ Non-binary operators (list takes N args)
 * ✅ Unary operators (car, cdr take 1 arg)
 *
 * LISP TERMINOLOGY:
 * - car: "Contents of Address Register" - first element of list
 * - cdr: "Contents of Decrement Register" - rest of list
 * - cons: Construct list (not implemented here)
 * - listp: Predicate to check if list
 *
 * This demonstrates extending the interpreter to support
 * richer language features beyond simple arithmetic.
 */

/**
 * List utility functions (Lisp-inspired)
 *
 * These helpers validate and manipulate lists safely.
 */

/**
 * Check if value is a non-empty list
 *
 * @param {any} list - Value to check
 * @returns {boolean} - true if non-empty array
 *
 * LISP CONVENTION:
 * listp (list predicate) checks if value is a list.
 * In JavaScript, lists are arrays.
 *
 * VALIDATION:
 * - Must be array
 * - Must have at least one element
 *
 * This prevents errors in car/cdr operations.
 */
const listp = (list) => Array.isArray(list) && list.length > 0;

/**
 * Get first element of list (car in Lisp)
 *
 * @param {Array} list - List to get head from
 * @returns {any} - First element
 *
 * LISP: (car '(1 2 3)) → 1
 *
 * "car" = Contents of Address Register
 * Historical name from early Lisp implementations.
 */
const head = (list) => list[0];

/**
 * Get rest of list (cdr in Lisp)
 *
 * @param {Array} list - List to get tail from
 * @returns {Array} - All elements except first
 *
 * LISP: (cdr '(1 2 3)) → '(2 3)
 *
 * "cdr" = Contents of Decrement Register
 * Historical name from early Lisp implementations.
 */
const tail = (list) => list.slice(1);

/**
 * Extended Operators Registry
 *
 * ADDITIONS to 2-improved.js:
 *
 * ARITHMETIC (same as before):
 * +, -, *, /
 *
 * COMPARISON (new):
 * eq - Equality check
 *
 * LIST OPERATIONS (new):
 * list - Create list from arguments
 * car - Get first element
 * cdr - Get rest of list
 *
 * OPERATOR TYPES:
 *
 * 1. BINARY (2 args): +, -, *, /, eq
 *    Applied with reduce: args.reduce(operator)
 *
 * 2. N-ARY (N args): list
 *    Takes all arguments: list(...args)
 *
 * 3. UNARY (1 arg): car, cdr
 *    Takes single argument: car(list)
 *
 * HANDLING DIFFERENT ARITIES:
 * See OperationExpression.interpret() for how these are handled.
 */
const OPERATORS = {
  // Binary arithmetic operators (same as 2-improved.js)
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  
  /**
   * Equality operator
   *
   * BINARY: (eq a b) → a === b
   *
   * Returns boolean (true/false).
   *
   * EXAMPLES:
   * (eq 3 3)     → true
   * (eq 3 4)     → false
   * (eq x y)     → true if x === y
   *
   * LISP EQUIVALENT:
   * (eq 3 3) in Lisp/Scheme
   */
  eq: (a, b) => a === b,
  
  /**
   * List constructor
   *
   * N-ARY: (list arg1 arg2 ... argN) → [arg1, arg2, ..., argN]
   *
   * Creates array from all arguments.
   *
   * VARIADIC OPERATOR:
   * Takes any number of arguments via rest parameters.
   *
   * EXAMPLES:
   * (list 1 2 3)        → [1, 2, 3]
   * (list x y z)        → [context.x, context.y, context.z]
   * (list (+ 1 2) 3)    → [3, 3]
   *
   * VALIDATION:
   * Returns null if empty (no arguments).
   *
   * LISP EQUIVALENT:
   * (list 1 2 3) in Scheme
   */
  list: (...list) => (listp(list) ? list : null),
  
  /**
   * Get first element (car)
   *
   * UNARY: (car list) → first element
   *
   * EXAMPLES:
   * (car (list 7 3 1))  → 7
   * (car (list x y z))  → context.x
   *
   * VALIDATION:
   * Returns null if not a valid list.
   *
   * LISP: car = "Contents of Address Register"
   * Modern: head, first, front
   */
  car: (list) => (listp(list) ? head(list) : null),
  
  /**
   * Get rest of list (cdr)
   *
   * UNARY: (cdr list) → all except first
   *
   * EXAMPLES:
   * (cdr (list 7 3 1))  → [3, 1]
   * (cdr (list 1))      → []
   *
   * VALIDATION:
   * Returns null if not a valid list.
   *
   * LISP: cdr = "Contents of Decrement Register"
   * Modern: tail, rest
   */
  cdr: (list) => (listp(list) ? tail(list) : null),
};

class NumberExpression {
  constructor(value) {
    this.value = parseFloat(value);
  }

  interpret() {
    return this.value;
  }
}

class VariableExpression {
  constructor(name) {
    this.name = name;
  }

  interpret(context) {
    if (!(this.name in context)) {
      throw new Error(`Variable "${this.name}" is not defined`);
    }
    return context[this.name];
  }
}

class OperationExpression {
  constructor(operator, operands) {
    this.operator = operator;
    this.operands = operands;
  }

  interpret(context) {
    const toValues = (operand) => operand.interpret(context);
    const args = this.operands.map((x) => toValues(x));
    const operator = OPERATORS[this.operator];
    if (!operator) throw new Error(`Unknown operator: ${operator}`);
    if (this.operator.length > 1) return operator(...args);
    return args.reduce(operator);
  }
}

const tokenize = (source) => {
  const stack = [];
  const parentStack = [];
  let current = stack;

  const tokens = source
    .replaceAll('(', ' ( ')
    .replaceAll(')', ' ) ')
    .trim()
    .split(/\s+/);

  for (const token of tokens) {
    if (token === '(') {
      const newStack = [];
      current.push(newStack);
      parentStack.push(current);
      current = newStack;
    } else if (token === ')') {
      current = parentStack.pop();
    } else {
      current.push(token);
    }
  }
  return stack[0];
};

const parse = (tokens) => {
  if (!Array.isArray(tokens)) {
    const isVar = isNaN(tokens);
    const Expression = isVar ? VariableExpression : NumberExpression;
    return new Expression(tokens);
  }
  const operator = tokens[0];
  const operands = tokens.slice(1);
  const operandExpressions = operands.map((x) => parse(x));
  return new OperationExpression(operator, operandExpressions);
};

const evaluate = (input, context = {}) => {
  const tokens = tokenize(input);
  const expression = parse(tokens);
  return expression.interpret(context);
};

// ===========================
// Usage Examples - Extended Operations
// ===========================

/**
 * EXAMPLE 1: Basic arithmetic (same as previous files)
 *
 * Program: (+ 2 (* x 5) (- y 2))
 * With context { x: 3, y: 7 }
 * Result: 2 + (3*5) + (7-2) = 22
 */
{
  const program = '(+ 2 (* x 5) (- y 2))';
  const context = { x: 3, y: 7 };
  const result = evaluate(program, context);
  const expected = 2 + 3 * 5 + (7 - 2);
  console.log({ program, expected, result });
  // Output: { program: '...', expected: 22, result: 22 }
}

/**
 * EXAMPLE 2: Equality comparison - TRUE
 *
 * NEW OPERATOR: eq
 * Tests if two values are equal
 */
{
  const program = '(eq 3 3)';
  const result = evaluate(program, {});
  const expected = true;
  console.log({ program, expected, result });
  // Output: { program: '(eq 3 3)', expected: true, result: true }
}

/**
 * EXAMPLE 3: Equality comparison - FALSE
 */
{
  const program = '(eq 3 4)';
  const result = evaluate(program, {});
  const expected = false;
  console.log({ program, expected, result });
  // Output: { program: '(eq 3 4)', expected: false, result: false }
}

/**
 * EXAMPLE 4: List creation
 *
 * NEW OPERATOR: list
 * Creates array from arguments
 */
{
  const program = '(list 7 3 1)';
  const result = evaluate(program, {});
  const expected = [7, 3, 1];
  console.log({ program, expected, result });
  // Output: { program: '(list 7 3 1)', expected: [7, 3, 1], result: [7, 3, 1] }
}

/**
 * EXAMPLE 5: Get first element (car)
 *
 * NEW OPERATOR: car
 * Gets first element of list (head)
 */
{
  const program = '(car (list 7 3 1)';
  const result = evaluate(program, {});
  const expected = 7;
  console.log({ program, expected, result });
  // Output: { program: '(car (list 7 3 1)', expected: 7, result: 7 }
}

/**
 * EXAMPLE 6: Get rest of list (cdr)
 *
 * NEW OPERATOR: cdr
 * Gets all elements except first (tail)
 */
{
  const program = '(cdr (list 7 3 1)';
  const result = evaluate(program, {});
  const expected = [3, 1];
  console.log({ program, expected, result });
  // Output: { program: '(cdr (list 7 3 1)', expected: [3, 1], result: [3, 1] }
}

/**
 * EXTENDED OPERATIONS SUMMARY:
 *
 * This file demonstrates extending interpreter with:
 *
 * 1. COMPARISON: eq operator for boolean results
 * 2. LIST OPS: list, car, cdr for Lisp-like list manipulation
 * 3. MIXED TYPES: Numbers, booleans, lists all supported
 * 4. COMPOSITION: Operations can nest (car (list ...))
 *
 * LISP-LIKE FEATURES:
 * - Prefix notation: (operator args...)
 * - First-class lists: (list 1 2 3)
 * - List accessors: car (head), cdr (tail)
 * - Symbolic expressions: Everything is expression
 *
 * EXTENSIBILITY DEMONSTRATED:
 * Added 4 new operators without modifying core classes.
 * Just updated OPERATORS registry.
 *
 * This shows the power of the registry approach!
 */

/**
 * PATTERN EVOLUTION COMPLETE:
 *
 * 1-classes.js:   Classical OOP, switch operators
 * 2-improved.js:  Operators registry, validation
 * 3-extended.js:  Extended operators (Lisp-like)
 *
 * KEY TAKEAWAYS:
 * 1. INTERPRETER PATTERN: Tokenize → Parse → Interpret
 * 2. RECURSIVE EVALUATION: AST traversed recursively
 * 3. EXTENSIBLE: Easy to add operators via registry
 * 4. COMPOSABLE: Expressions nest arbitrarily
 * 5. TYPE-FLEXIBLE: Numbers, strings, booleans, lists
 * 6. LISP-INSPIRED: Shows classic Lisp operations
 *
 * This interpreter could be extended further with:
 * - Conditionals: (if condition then else)
 * - Functions: (lambda (x) (+ x 1))
 * - Let bindings: (let ((x 5)) (+ x 1))
 * - Recursion: (define factorial ...)
 *
 * The pattern provides foundation for building
 * complete domain-specific languages!
 */
