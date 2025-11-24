'use strict';

/**
 * FILE PURPOSE: Improved Interpreter - Operators Registry & Validation
 *
 * This file improves on 1-classes.js with:
 * ✅ Operators registry (instead of switch statement)
 * ✅ Variable validation (error if undefined)
 * ✅ Operator validation (error if unknown)
 * ✅ No abstract base class (simpler)
 * ✅ Functional tokenize/parse (not classes)
 * ✅ Single evaluate() function (simpler API)
 *
 * IMPROVEMENTS OVER 1-classes.js:
 *
 * 1. OPERATORS REGISTRY:
 *    Before: switch (operator) { case '+': ... }
 *    After:  OPERATORS[operator]
 *    Benefit: Easy to add new operators
 *
 * 2. VARIABLE VALIDATION:
 *    Before: Returns undefined if variable missing
 *    After:  Throws error if variable missing
 *    Benefit: Fail fast with clear error
 *
 * 3. NO ABSTRACT CLASS:
 *    Before: class Expression { abstract }
 *    After:  Individual classes only
 *    Benefit: Less boilerplate
 *
 * 4. FUNCTIONAL UTILITIES:
 *    Before: class Tokenizer, class Parser
 *    After:  function tokenize(), function parse()
 *    Benefit: Simpler, more JavaScript-idiomatic
 *
 * 5. SIMPLIFIED API:
 *    Before: new Evaluator(input).evaluate(context)
 *    After:  evaluate(input, context)
 *    Benefit: Direct function call
 *
 * This is the RECOMMENDED implementation for JavaScript!
 */

/**
 * Operators Registry
 *
 * PATTERN: Registry + Strategy
 *
 * Maps operator symbols to implementation functions.
 *
 * BENEFITS vs switch statement:
 * ✅ Extensible: Add operator without modifying OperationExpression
 * ✅ Dynamic: Can add/remove operators at runtime
 * ✅ Testable: Each operator function tested independently
 * ✅ Reusable: Operator functions are pure, reusable
 *
 * ADDING NEW OPERATORS:
 * Just add to this object:
 *   OPERATORS['%'] = (a, b) => a % b;
 *   OPERATORS['**'] = (a, b) => a ** b;
 *
 * No need to modify OperationExpression class!
 *
 * OPERATOR SIGNATURE:
 * (a: number, b: number) => number
 * Binary operators that reduce over array of values
 */
const OPERATORS = {
  '+': (a, b) => a + b,  // Addition
  '-': (a, b) => a - b,  // Subtraction
  '*': (a, b) => a * b,  // Multiplication
  '/': (a, b) => a / b,  // Division
  
  // Easy to add more:
  // '%': (a, b) => a % b,       // Modulo
  // '**': (a, b) => a ** b,     // Exponentiation
  // 'min': (a, b) => Math.min(a, b),
  // 'max': (a, b) => Math.max(a, b),
};

/**
 * Number Expression (Terminal) - Simplified
 *
 * NO EXTENDS: Doesn't extend abstract base class.
 * Simpler, but loses type checking benefits.
 *
 * TRADE-OFF:
 * - Lost: Abstract class contract enforcement
 * - Gained: Less boilerplate, simpler code
 */
class NumberExpression {
  constructor(value) {
    this.value = parseFloat(value);
  }

  /**
   * Interpret number
   *
   * NO VALIDATION: Doesn't call super.interpret()
   * Doesn't need context (numbers are self-contained)
   *
   * @returns {number} - The numeric value
   */
  interpret() {
    return this.value;
  }
}

/**
 * Variable Expression (Terminal) - Improved
 *
 * IMPROVEMENT: Validates variable exists in context!
 *
 * vs 1-classes.js:
 * - 1-classes.js: Returns undefined if missing
 * - 2-improved.js: Throws error if missing (better!)
 */
class VariableExpression {
  constructor(name) {
    this.name = name;
  }

  /**
   * Interpret variable with validation
   *
   * @param {Object} context - Variable bindings
   * @returns {any} - Value from context
   * @throws {Error} - If variable not in context
   *
   * VALIDATION:
   * Checks if variable exists before accessing.
   *
   * FAIL-FAST:
   * Throws immediately if variable missing.
   * Better than returning undefined (silent error).
   *
   * EXAMPLE:
   *
   * interpret({ x: 42 })  → 42  ✓
   * interpret({})         → Error: Variable "x" is not defined
   */
  interpret(context) {
    // Validate variable exists
    if (!(this.name in context)) {
      throw new Error(`Variable "${this.name}" is not defined`);
    }
    
    return context[this.name];
  }
}

/**
 * Operation Expression (Nonterminal) - Improved
 *
 * IMPROVEMENT: Uses operators registry instead of switch!
 *
 * BENEFITS:
 * ✅ Extensible (add operators without modifying class)
 * ✅ Validates operator exists
 * ✅ Cleaner code (no switch statement)
 */
class OperationExpression {
  constructor(operator, operands) {
    this.operator = operator;
    this.operands = operands;
  }

  /**
   * Interpret operation using operators registry
   *
   * @param {Object} context - Variable bindings
   * @returns {any} - Result of operation
   * @throws {Error} - If operator unknown
   *
   * EXECUTION:
   *
   * 1. INTERPRET OPERANDS:
   *    Recursively interpret each operand.
   *    const toValues = (operand) => operand.interpret(context);
   *    const args = operands.map(toValues);
   *
   * 2. LOOKUP OPERATOR:
   *    const operator = OPERATORS[this.operator];
   *    If not found, throw error.
   *
   * 3. APPLY OPERATOR:
   *    args.reduce(operator)
   *    Applies binary operator to all values.
   *
   * IMPROVEMENT:
   * Validates operator exists (throws if unknown).
   * 1-classes.js also validates, but via switch default.
   * This approach is more extensible.
   */
  interpret(context) {
    // Helper: Interpret operand to value
    const toValues = (operand) => operand.interpret(context);
    
    // Recursively interpret all operands
    const args = this.operands.map(toValues);
    
    // Lookup operator function from registry
    const operator = OPERATORS[this.operator];
    
    // Validate operator exists
    if (!operator) {
      throw new Error(`Unknown operator: ${this.operator}`);  // Note: Shows string, not function
    }
    
    // Apply operator via reduce
    return args.reduce(operator);
  }
}

/**
 * Tokenize function (not class) - Simplified
 *
 * IMPROVEMENT: Plain function instead of class.
 *
 * @param {string} source - Input program
 * @returns {Array} - Nested token structure
 *
 * SAME ALGORITHM as Tokenizer class in 1-classes.js,
 * just as a function instead of a class.
 *
 * BENEFITS:
 * ✅ Simpler (no class overhead)
 * ✅ Pure function (no state)
 * ✅ More functional style
 * ✅ Easier to test
 *
 * Same tokenization logic, different packaging!
 */
const tokenize = (source) => {
  const stack = [];
  const parentStack = [];
  let current = stack;

  // Split into tokens with spacing around parens
  const tokens = source
    .replaceAll('(', ' ( ')
    .replaceAll(')', ' ) ')
    .trim()
    .split(/\s+/);

  // Build nested structure
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
  
  return stack[0];  // Return result directly
};

/**
 * Parse function (not class) - Simplified
 *
 * IMPROVEMENT: Plain function instead of static class method.
 *
 * @param {string|Array} tokens - Tokens to parse
 * @returns {Expression} - Expression tree
 *
 * SAME LOGIC as Parser.parse in 1-classes.js,
 * just as standalone function.
 *
 * BENEFITS:
 * ✅ Simpler (no class)
 * ✅ Clear function signature
 * ✅ More functional
 *
 * RECURSIVE PARSING:
 * Same recursive strategy as 1-classes.js.
 */
const parse = (tokens) => {
  // Terminal: Not array
  if (!Array.isArray(tokens)) {
    const isVar = isNaN(tokens);
    const Expression = isVar ? VariableExpression : NumberExpression;
    return new Expression(tokens);
  }
  
  // Nonterminal: Array
  const operator = tokens[0];
  const operands = tokens.slice(1);
  const operandExpressions = operands.map(parse);  // Recursive
  return new OperationExpression(operator, operandExpressions);
};

/**
 * Evaluate function - All-in-one
 *
 * IMPROVEMENT: Single function for entire flow.
 *
 * @param {string} input - Program to evaluate
 * @param {Object} context - Variable bindings (default: {})
 * @returns {any} - Result of evaluation
 *
 * ORCHESTRATION:
 * Combines tokenize → parse → interpret into one call.
 *
 * vs 1-classes.js:
 * - 1-classes: new Evaluator(input).evaluate(context)
 * - 2-improved: evaluate(input, context)
 *
 * SIMPLER API:
 * Direct function call, no class instantiation needed.
 *
 * COMPLETE FLOW:
 *
 * evaluate("(+ 2 (* x 5))", { x: 3 })
 *   ↓
 * 1. tokenize → ['+', '2', ['*', 'x', '5']]
 * 2. parse → OperationExpression('+', [...])
 * 3. interpret → 2 + (3 * 5) = 17
 *   ↓
 * Result: 17
 */
const evaluate = (input, context = {}) => {
  const tokens = tokenize(input);
  console.log({ tokens });  // Debug output
  const expression = parse(tokens);
  return expression.interpret(context);
};

// ===========================
// Usage Example
// ===========================

/**
 * Evaluate program (same as 1-classes.js)
 *
 * SIMPLER API:
 * Just call evaluate() function.
 * No need for: new Evaluator(program).evaluate(context)
 *
 * PROGRAM: (+ 2 (* x 5) (- y 2))
 *
 * EVALUATION with { x: 3, y: 7 }:
 * - (* x 5) → 3 * 5 = 15
 * - (- y 2) → 7 - 2 = 5
 * - (+ 2 15 5) → 22
 */
const program = '(+ 2 (* x 5) (- y 2))';
const context = { x: 3, y: 7 };
const result = evaluate(program, context);
const expected = 2 + 3 * 5 + (7 - 2);
console.log({ expected, result });
// Output: { expected: 22, result: 22 }

/**
 * IMPROVEMENTS DEMONSTRATED:
 *
 * 1. OPERATORS REGISTRY:
 *    Easy to extend:
 *      OPERATORS['%'] = (a, b) => a % b;
 *      evaluate("(% 10 3)", {})  // 1
 *
 * 2. VARIABLE VALIDATION:
 *    Missing variable throws clear error:
 *      evaluate("(+ x y)", { x: 5 })
 *      // Error: Variable "y" is not defined
 *
 * 3. OPERATOR VALIDATION:
 *    Unknown operator throws error:
 *      evaluate("(^ 2 3)", {})
 *      // Error: Unknown operator: ^
 *
 * 4. FUNCTIONAL STYLE:
 *    No classes for utilities (tokenize, parse, evaluate).
 *    More JavaScript-idiomatic.
 *
 * 5. SIMPLER API:
 *    evaluate(program, context)
 *    vs
 *    new Evaluator(program).evaluate(context)
 */

/**
 * EXTENDING THE LANGUAGE:
 *
 * Adding new operators is trivial:
 */
// OPERATORS['%'] = (a, b) => a % b;
// OPERATORS['**'] = (a, b) => a ** b;
// OPERATORS['>'] = (a, b) => a > b;
// OPERATORS['<'] = (a, b) => a < b;
// OPERATORS['eq'] = (a, b) => a === b;

// Now can evaluate:
// evaluate("(% 10 3)", {})      // 1 (modulo)
// evaluate("(** 2 8)", {})      // 256 (power)
// evaluate("(> x 100)", { x: 150 })  // true (comparison)

/**
 * COMPARISON TO 1-classes.js:
 *
 * ┌──────────────────┬─────────────────┬──────────────────┐
 * │    Feature       │   1-classes.js  │  2-improved.js   │
 * ├──────────────────┼─────────────────┼──────────────────┤
 * │ Abstract class   │      ✓          │       ✗          │
 * │ Operators        │    Switch       │    Registry      │
 * │ Variable check   │      ✗          │       ✓          │
 * │ Operator check   │    Switch       │    Explicit      │
 * │ Utilities        │    Classes      │    Functions     │
 * │ API complexity   │    High         │     Low          │
 * │ Extensibility    │    Medium       │     High         │
 * │ Boilerplate      │    More         │     Less         │
 * └──────────────────┴─────────────────┴──────────────────┘
 *
 * WHEN TO USE THIS VERSION:
 * ✅ Prefer simplicity over formality
 * ✅ Want easy operator extension
 * ✅ Don't need abstract class enforcement
 * ✅ Functional programming style
 * ✅ JavaScript-idiomatic code
 *
 * WHEN TO USE 1-classes.js:
 * ✅ Need abstract class contract
 * ✅ TypeScript with interfaces
 * ✅ Strict OOP requirements
 * ✅ Team prefers formal patterns
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. REGISTRY PATTERN: Operators as object properties
 * 2. VALIDATION: Check variables and operators
 * 3. FUNCTIONAL: Utilities as functions, not classes
 * 4. SIMPLIFIED: Direct evaluate() call
 * 5. EXTENSIBLE: Easy to add operators
 * 6. CLEAN: Less boilerplate, same functionality
 *
 * PATTERN EVOLUTION:
 * 1-classes.js:   Full OOP (abstract class, switch operators)
 * 2-improved.js:  Hybrid (simple classes, registry operators)
 * 3-extended.js:  Extended (add list operations, comparisons)
 *
 * This version is the sweet spot for JavaScript projects!
 */
