'use strict';

/**
 * FILE PURPOSE: Classical Interpreter Pattern (Full OOP)
 *
 * This file demonstrates the Gang of Four Interpreter pattern with:
 * - Abstract Expression base class
 * - Terminal expressions (Number, Variable)
 * - Nonterminal expressions (Operations)
 * - Parser (converts tokens to AST)
 * - Tokenizer (converts string to tokens)
 * - Evaluator (coordinates the process)
 *
 * LANGUAGE BEING INTERPRETED:
 * Lisp-like prefix notation:
 *   (+ 2 3)           → 2 + 3 = 5
 *   (* x 5)           → x * 5
 *   (+ 2 (* 3 4))     → 2 + (3 * 4) = 14
 *
 * PATTERN FLOW:
 * Input String → Tokenizer → Tokens → Parser → AST → Interpreter → Result
 * "(+ 2 3)"      ['+','2','3']        Tree   evaluate()       5
 *
 * This is the CLASSICAL GoF implementation with full OOP hierarchy.
 */

/**
 * Abstract Expression Base Class
 *
 * Defines the interface that all expressions must implement.
 *
 * PATTERN ROLE: AbstractExpression
 *
 * RESPONSIBILITIES:
 * 1. Define interpret() interface
 * 2. Prevent direct instantiation (abstract class simulation)
 * 3. Validate context parameter
 *
 * COMPOSITE PATTERN:
 * Expression hierarchy forms a Composite pattern:
 * - Expression (Component)
 * - Number/Variable (Leaf)
 * - Operation (Composite)
 *
 * This enables building complex expressions from simple ones.
 */
class Expression {
  /**
   * Abstract interpret method with validation
   *
   * @param {Object} context - Variable bindings { varName: value }
   * @throws {Error} - If called on abstract class or without context
   * @returns {any} - Implemented by subclasses
   *
   * VALIDATION:
   * 1. Check if being called on abstract class (not allowed)
   * 2. Check if context provided (required for variable lookup)
   *
   * ABSTRACT CLASS SIMULATION:
   * JavaScript doesn't have true abstract classes.
   * We simulate it by checking if prototype.constructor === Expression.
   * If yes, it's the abstract class itself, throw error.
   */
  interpret(context) {
    // Check if abstract class is being instantiated
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === Expression) {
      throw new Error('Abstract interpret() must be implemented');
    }
    
    // Validate context is provided
    if (!context) {
      throw new Error('Argument "context" must be passed');
    }
    
    // Subclasses will call super.interpret(context) for validation,
    // then implement their own logic
  }
}

/**
 * Terminal Expression: Number
 *
 * PATTERN ROLE: TerminalExpression
 *
 * Represents a numeric literal in the expression.
 * Leaf node in AST (no children).
 *
 * EXAMPLE:
 * In "(+ 2 3)", the 2 and 3 are NumberExpressions.
 *
 * INTERPRETATION:
 * Simply returns its numeric value (no recursion needed).
 */
class NumberExpression extends Expression {
  /**
   * Create number expression
   *
   * @param {string|number} value - Numeric value (string will be parsed)
   *
   * PARSING:
   * parseFloat() converts string to number.
   * Handles: "42", "3.14", "1e3"
   */
  constructor(value) {
    super();
    this.value = parseFloat(value);
  }

  /**
   * Interpret number (just return value)
   *
   * @param {Object} context - Not used for numbers (self-contained)
   * @returns {number} - The numeric value
   *
   * TERMINAL EXPRESSION:
   * No children to interpret.
   * No recursion.
   * Just returns stored value.
   *
   * EXECUTION:
   * new NumberExpression('42').interpret() → 42
   * new NumberExpression('3.14').interpret() → 3.14
   */
  interpret(context) {
    super.interpret(context);  // Validation
    return this.value;
  }
}

/**
 * Terminal Expression: Variable
 *
 * PATTERN ROLE: TerminalExpression
 *
 * Represents a variable reference in the expression.
 * Leaf node in AST (no children).
 *
 * EXAMPLE:
 * In "(+ x y)", x and y are VariableExpressions.
 *
 * INTERPRETATION:
 * Looks up variable value in context.
 * Context must contain the variable or error is thrown.
 */
class VariableExpression extends Expression {
  /**
   * Create variable expression
   *
   * @param {string} name - Variable name to lookup
   *
   * EXAMPLE:
   * new VariableExpression('x')
   * Will lookup 'x' in context when interpreted
   */
  constructor(name) {
    super();
    this.name = name;
  }

  /**
   * Interpret variable (lookup in context)
   *
   * @param {Object} context - Variable bindings { varName: value }
   * @returns {any} - Value from context
   *
   * TERMINAL EXPRESSION:
   * No children, but needs context.
   *
   * EXECUTION:
   * new VariableExpression('x').interpret({ x: 42 }) → 42
   * new VariableExpression('y').interpret({ x: 42 }) → Error: y not defined
   *
   * ERROR HANDLING:
   * In this version, no validation - will return undefined if variable missing.
   * Better version would throw error (see 2-improved.js).
   */
  interpret(context) {
    super.interpret(context);  // Validation
    return context[this.name];  // ⚠️ Returns undefined if missing
  }
}

/**
 * Nonterminal Expression: Operation
 *
 * PATTERN ROLE: NonterminalExpression
 *
 * Represents an operation on operands.
 * Composite node in AST (has children = operands).
 *
 * EXAMPLE:
 * In "(+ 2 (* 3 4))", the + and * are OperationExpressions.
 *
 * STRUCTURE:
 * OperationExpression {
 *   operator: '+',
 *   operands: [
 *     NumberExpression(2),
 *     OperationExpression('*', [
 *       NumberExpression(3),
 *       NumberExpression(4)
 *     ])
 *   ]
 * }
 *
 * INTERPRETATION:
 * 1. Recursively interpret all operands
 * 2. Apply operator to results
 * 3. Return final result
 */
class OperationExpression extends Expression {
  /**
   * Create operation expression
   *
   * @param {string} operator - Operator symbol (+, -, *, /)
   * @param {Expression[]} operands - Child expressions
   *
   * COMPOSITE PATTERN:
   * operands are other Expression instances (could be Number, Variable, or Operation).
   * This enables recursive composition.
   */
  constructor(operator, operands) {
    super();
    this.operator = operator;  // '+', '-', '*', '/'
    this.operands = operands;   // Array of Expression instances
  }

  /**
   * Interpret operation recursively
   *
   * @param {Object} context - Variable bindings
   * @returns {number} - Result of operation
   *
   * RECURSIVE INTERPRETATION:
   *
   * STEP 1: Interpret all operands
   * Each operand.interpret(context) recursively:
   * - If Number: Returns value
   * - If Variable: Returns context[name]
   * - If Operation: Recursively interprets (calls this method again)
   *
   * STEP 2: Apply operator to results
   * Use reduce to apply binary operator to all values.
   *
   * EXECUTION EXAMPLE:
   *
   * Expression: (+ 2 (* 3 4))
   *
   * OperationExpression('+', [2, (*,3,4)]).interpret()
   *   ↓
   * 1. Interpret operands:
   *    - NumberExpression(2).interpret() → 2
   *    - OperationExpression('*', [3,4]).interpret()
   *      → NumberExpression(3).interpret() → 3
   *      → NumberExpression(4).interpret() → 4
   *      → Apply '*': 3 * 4 = 12
   *   ↓
   * 2. args = [2, 12]
   * 3. Apply '+': 2 + 12 = 14
   *   ↓
   * Result: 14
   *
   * OPERATOR APPLICATION:
   * Uses switch statement to select operation.
   * reduce() applies binary operator to array of values.
   *
   * INITIAL VALUES:
   * - '+': Start with 0 (identity for addition)
   * - '*': Start with 1 (identity for multiplication)
   * - '-', '/': Start with first value (reduce without initial)
   *
   * LIMITATION:
   * Hard-coded operators (see 2-improved.js for registry approach).
   */
  interpret(context) {
    // STEP 1: Recursively interpret all operands
    const args = this.operands.map((operand) => operand.interpret(context));
    
    // STEP 2: Apply operator to interpreted values
    switch (this.operator) {
      case '+':
        // Addition: Sum all values, start with 0
        return args.reduce((a, b) => a + b, 0);
      
      case '-':
        // Subtraction: First - second - third - ...
        return args.reduce((a, b) => a - b);
      
      case '*':
        // Multiplication: Product of all values, start with 1
        return args.reduce((a, b) => a * b, 1);
      
      case '/':
        // Division: First / second / third / ...
        return args.reduce((a, b) => a / b);
      
      default:
        // Unknown operator
        throw new Error(`Unknown operator: ${this.operator}`);
    }
  }
}

/**
 * Parser Class
 *
 * Converts tokens (nested arrays) into Abstract Syntax Tree (AST).
 *
 * PATTERN ROLE: Parser/Builder
 *
 * RESPONSIBILITY:
 * Transform token structure into Expression objects.
 *
 * INPUT: Nested arrays from tokenizer
 * OUTPUT: Expression tree
 *
 * PARSING STRATEGY:
 * 1. If not array: Terminal expression (Number or Variable)
 * 2. If array: Nonterminal expression (Operation)
 *    - First element is operator
 *    - Rest are operands (recursively parse)
 */
class Parser {
  /**
   * Parse tokens into AST (static method - no instance needed)
   *
   * @param {string|Array} tokens - Tokens to parse
   * @returns {Expression} - Root of expression tree
   *
   * RECURSIVE PARSING:
   *
   * CASE 1: TERMINAL (not array)
   * tokens = '42' or 'x'
   * → Check if number or variable (isNaN)
   * → Create NumberExpression or VariableExpression
   *
   * CASE 2: NONTERMINAL (array)
   * tokens = ['+', '2', ['*', '3', '4']]
   * → First element is operator: '+'
   * → Rest are operands: ['2', ['*', '3', '4']]
   * → Recursively parse each operand:
   *   - '2' → NumberExpression(2)
   *   - ['*', '3', '4'] → OperationExpression('*', ...)
   * → Create OperationExpression('+', [operands])
   *
   * EXAMPLE:
   *
   * parse('42')
   *   → isNaN('42') = false
   *   → new NumberExpression('42')
   *
   * parse('x')
   *   → isNaN('x') = true
   *   → new VariableExpression('x')
   *
   * parse(['+', '2', '3'])
   *   → operator = '+'
   *   → operands = ['2', '3']
   *   → parse('2') → NumberExpression(2)
   *   → parse('3') → NumberExpression(3)
   *   → new OperationExpression('+', [Number(2), Number(3)])
   *
   * parse(['+', '2', ['*', '3', '4']])
   *   → operator = '+'
   *   → operands = ['2', ['*', '3', '4']]
   *   → parse('2') → NumberExpression(2)
   *   → parse(['*', '3', '4']) → OperationExpression('*', ...)
   *     → operator = '*'
   *     → parse('3') → NumberExpression(3)
   *     → parse('4') → NumberExpression(4)
   *     → OperationExpression('*', [Number(3), Number(4)])
   *   → new OperationExpression('+', [Number(2), Operation('*', ...)])
   *
   * RECURSION:
   * Parser.parse calls itself for nested expressions.
   * Base case: String (terminal)
   * Recursive case: Array (nonterminal)
   */
  static parse(tokens) {
    // TERMINAL EXPRESSION: Single token (string)
    if (!Array.isArray(tokens)) {
      // Determine if number or variable
      return isNaN(tokens)
        ? new VariableExpression(tokens)  // Variable (e.g., 'x', 'price')
        : new NumberExpression(tokens);    // Number (e.g., '42', '3.14')
    }
    
    // NONTERMINAL EXPRESSION: Array [operator, ...operands]
    const [operator, ...operands] = tokens;
    
    // Recursively parse each operand
    const operandExpressions = operands.map(Parser.parse);
    
    // Create operation with parsed operands
    return new OperationExpression(operator, operandExpressions);
  }
}

/**
 * Tokenizer Class
 *
 * Converts input string into nested token structure.
 *
 * PATTERN ROLE: Lexer/Tokenizer
 *
 * RESPONSIBILITY:
 * Transform linear string into hierarchical token structure.
 *
 * INPUT: "(+ 2 (* 3 4))"
 * OUTPUT: ['+', '2', ['*', '3', '4']]
 *
 * TOKENIZATION PROCESS:
 * 1. Add spaces around parens: "(+ 2 (* 3 4))" → " ( + 2  ( * 3 4 )  ) "
 * 2. Split on whitespace: ['(', '+', '2', '(', '*', '3', '4', ')', ')']
 * 3. Build nested structure using stacks
 */
class Tokenizer {
  /**
   * Create tokenizer and tokenize input
   *
   * @param {string} source - Input string to tokenize
   * @returns {Array} - Nested token structure
   *
   * UNUSUAL PATTERN:
   * Constructor returns value (this.stack[0]) instead of instance!
   *
   * USAGE:
   * const tokens = new Tokenizer("(+ 2 3)");
   * // tokens = ['+', '2', '3'] (not Tokenizer instance!)
   *
   * This works because:
   * 1. Constructor can return any value
   * 2. If primitive or object returned, that's what 'new' returns
   * 3. This bypasses normal instance creation
   *
   * MORE TYPICAL:
   * const tokenizer = new Tokenizer(source);
   * const tokens = tokenizer.tokens;
   *
   * But this pattern is used here for convenience.
   */
  constructor(source) {
    this.source = source;
    this.stack = [];
    this.tokenize();  // Tokenize immediately
    return this.stack[0];  // ⚠️ Return tokens, not instance!
  }

  /**
   * Tokenize source into nested structure
   *
   * ALGORITHM: Stack-based parser for parentheses
   *
   * PROCESS:
   * 1. Add spaces around parentheses
   * 2. Split into tokens
   * 3. Use two stacks to track nesting:
   *    - stack: Current nesting level
   *    - parentStack: Parent levels
   * 4. Build nested arrays matching parentheses
   *
   * EXAMPLE EXECUTION:
   *
   * Input: "(+ 2 (* 3 4))"
   *
   * After spacing and splitting:
   * ['(', '+', '2', '(', '*', '3', '4', ')', ')']
   *
   * Token-by-token processing:
   *
   * Token '(':
   *   - Create new array []
   *   - Push to current: [[]]
   *   - Save current in parentStack
   *   - Move current to new array
   *
   * Token '+':
   *   - Push to current: ['+']
   *
   * Token '2':
   *   - Push to current: ['+', '2']
   *
   * Token '(':
   *   - Create new array []
   *   - Push to current: ['+', '2', []]
   *   - Save current in parentStack
   *   - Move current to new array
   *
   * Token '*':
   *   - Push to current: ['*']
   *
   * Token '3':
   *   - Push to current: ['*', '3']
   *
   * Token '4':
   *   - Push to current: ['*', '3', '4']
   *
   * Token ')':
   *   - Pop from parentStack: current = ['+', '2', ['*', '3', '4']]
   *
   * Token ')':
   *   - Pop from parentStack: current = [['+', '2', ['*', '3', '4']]]
   *
   * RESULT:
   * this.stack = [['+', '2', ['*', '3', '4']]]
   * this.stack[0] = ['+', '2', ['*', '3', '4']]
   */
  tokenize() {
    const parentStack = [];  // Stack of parent arrays
    let current = this.stack;  // Current working array
    
    /**
     * Prepare tokens:
     * 1. Add spaces around parentheses
     * 2. Trim whitespace
     * 3. Split on whitespace
     *
     * "(+ 2 3)" → " ( + 2 3 )  " → ['(', '+', '2', '3', ')']
     */
    const tokens = this.source
      .replaceAll('(', ' ( ')   // "(" → " ( "
      .replaceAll(')', ' ) ')   // ")" → " ) "
      .trim()                    // Remove leading/trailing spaces
      .split(/\s+/);             // Split on one or more spaces
    
    /**
     * Build nested structure
     *
     * STACK ALGORITHM:
     * - '(': Start new nesting level
     * - ')': End current nesting level
     * - other: Add to current level
     */
    for (const token of tokens) {
      if (token === '(') {
        // Start new nesting level
        const newStack = [];
        current.push(newStack);    // Add to current level
        parentStack.push(current); // Save current for later
        current = newStack;        // Move into new level
      } else if (token === ')') {
        // End current nesting level
        current = parentStack.pop();  // Return to parent level
      } else {
        // Regular token: operator, number, or variable
        current.push(token);
      }
    }
  }
}

/**
 * Evaluator Class
 *
 * PATTERN ROLE: Client/Coordinator
 *
 * Coordinates tokenization, parsing, and interpretation.
 *
 * RESPONSIBILITIES:
 * 1. Store input program
 * 2. Coordinate tokenization
 * 3. Coordinate parsing
 * 4. Coordinate interpretation
 * 5. Return final result
 *
 * FACADE PATTERN:
 * Provides simple interface (evaluate) that hides complexity
 * of tokenization → parsing → interpretation.
 */
class Evaluator {
  /**
   * Create evaluator with program
   *
   * @param {string} input - Program to evaluate
   */
  constructor(input) {
    this.input = input;
  }

  /**
   * Evaluate program with context
   *
   * @param {Object} context - Variable bindings (default: {})
   * @returns {any} - Result of evaluation
   *
   * ORCHESTRATION:
   * This method coordinates the three phases:
   *
   * PHASE 1: TOKENIZATION
   * String → Tokens
   * "(+ 2 3)" → ['+', '2', '3']
   *
   * PHASE 2: PARSING
   * Tokens → AST
   * ['+', '2', '3'] → OperationExpression('+', [Number(2), Number(3)])
   *
   * PHASE 3: INTERPRETATION
   * AST + Context → Result
   * OperationExpression.interpret({}) → 5
   *
   * COMPLETE FLOW:
   *
   * evaluate("(+ 2 (* x 5))", { x: 3 })
   *   ↓
   * 1. new Tokenizer("(+ 2 (* x 5))") → ['+', '2', ['*', 'x', '5']]
   * 2. Parser.parse([...]) → OperationExpression('+', [
   *      NumberExpression(2),
   *      OperationExpression('*', [VariableExpression('x'), NumberExpression(5)])
   *    ])
   * 3. expression.interpret({ x: 3 })
   *    → 2 + (3 * 5) = 17
   *   ↓
   * Result: 17
   */
  evaluate(context = {}) {
    // Phase 1: Tokenize
    const tokens = new Tokenizer(this.input);
    console.log({ tokens });  // Debug: Show token structure
    
    // Phase 2: Parse
    const expression = Parser.parse(tokens);
    
    // Phase 3: Interpret
    return expression.interpret(context);
  }
}

// ===========================
// Usage Example
// ===========================

/**
 * Program to evaluate
 *
 * SYNTAX: Lisp-like prefix notation
 * (operator operand1 operand2 ...)
 *
 * PROGRAM: (+ 2 (* x 5) (- y 2))
 *
 * BREAKDOWN:
 * - Outer operation: +
 * - Operands:
 *   1. 2 (number)
 *   2. (* x 5) (operation: x * 5)
 *   3. (- y 2) (operation: y - 2)
 *
 * WITH CONTEXT { x: 3, y: 7 }:
 * - (* x 5) → 3 * 5 = 15
 * - (- y 2) → 7 - 2 = 5
 * - (+ 2 15 5) → 2 + 15 + 5 = 22
 *
 * EQUIVALENT INFIX:
 * 2 + (x * 5) + (y - 2)
 * = 2 + (3 * 5) + (7 - 2)
 * = 2 + 15 + 5
 * = 22
 */
const program = '(+ 2 (* x 5) (- y 2))';

/**
 * Context with variable bindings
 *
 * Maps variable names to values.
 * VariableExpressions will lookup values here.
 */
const context = { x: 3, y: 7 };

/**
 * Create evaluator and evaluate program
 *
 * EXECUTION:
 * 1. Evaluator stores program
 * 2. evaluate(context) tokenizes, parses, interprets
 * 3. Returns result
 */
const evaluator = new Evaluator(program, context);
const result = evaluator.evaluate(context);

/**
 * Verify result matches expected
 *
 * CALCULATION:
 * 2 + 3 * 5 + (7 - 2)
 * = 2 + 15 + 5
 * = 22
 */
const expected = 2 + 3 * 5 + (7 - 2);
console.log({ expected, result });
// Output: { expected: 22, result: 22 }

/**
 * INTERPRETER PATTERN DEMONSTRATION:
 *
 * This example shows complete Interpreter pattern:
 *
 * 1. GRAMMAR:
 *    Expression ::= Number | Variable | Operation
 *    Operation ::= '(' Operator Expression+ ')'
 *    Operator ::= '+' | '-' | '*' | '/'
 *
 * 2. TOKENIZATION:
 *    String → Nested arrays
 *
 * 3. PARSING:
 *    Nested arrays → Expression tree (AST)
 *
 * 4. INTERPRETATION:
 *    AST + Context → Result
 *
 * 5. COMPOSITION:
 *    Operations can contain other operations (recursive)
 *
 * 6. EXTENSIBILITY:
 *    Easy to add new expression types or operators
 *
 * PATTERN BENEFITS SHOWN:
 * ✅ Custom syntax (Lisp-like)
 * ✅ Variable substitution (context)
 * ✅ Nested expressions (composition)
 * ✅ Clear separation (tokenize → parse → interpret)
 * ✅ Type-safe (Expression hierarchy)
 *
 * LIMITATIONS:
 * ❌ Hard-coded operators (see 2-improved.js for registry)
 * ❌ No variable validation (see 2-improved.js for checks)
 * ❌ Limited operators (see 3-extended.js for more)
 *
 * NEXT FILES:
 * - 2-improved.js: Operators registry, better validation
 * - 3-extended.js: Extended with list operations (Lisp-like)
 */
