# Interpreter Pattern

## Overview

The **Interpreter Pattern** defines a representation for a grammar along with an interpreter that uses the representation to interpret sentences in the language. It's used to build interpreters for domain-specific languages (DSLs), expression evaluators, and parsers.

## Problem Statement

### Need to Interpret Custom Language or Expressions

Applications often need to evaluate expressions or mini-languages:

```javascript
// Hard-coded logic
const result = calculate(2, 3, 5, 7);  // What operation?

// String expressions needing interpretation
const expression = "(+ 2 (* 3 5) (- 7 2))";  // How to evaluate this?

// Configuration languages
const rule = "price > 100 AND quantity < 50";  // How to evaluate rules?
```

**Problems:**
1. **Hard-coded logic**: Can't change operations without code changes
2. **No flexibility**: Can't let users define expressions
3. **Limited expressiveness**: Fixed operations only
4. **No composition**: Can't build complex expressions from simple ones

## Solution: Interpreter Pattern

Build an interpreter that:
1. **Tokenizes** input into tokens
2. **Parses** tokens into Abstract Syntax Tree (AST)
3. **Interprets** AST to produce results

### Pattern Components

```
Input String → Tokenizer → Tokens → Parser → AST → Interpreter → Result
"(+ 2 3)"     ['(', '+', '2', '3', ')']  Tree  evaluate()     5
```

**Participants:**
1. **AbstractExpression**: Interface for interpreting
2. **TerminalExpression**: Leaf nodes (numbers, variables)
3. **NonterminalExpression**: Composite nodes (operations)
4. **Context**: Environment with variable values
5. **Parser**: Converts tokens to AST
6. **Tokenizer**: Converts string to tokens

## Core Concepts

### 1. Abstract Syntax Tree (AST)

Tree representation of expression:

```
Expression: (+ 2 (* x 5))
Context: { x: 3 }

AST:
      +
     / \
    2   *
       / \
      x   5
      ↓
      3  (from context)
      
Evaluation:
  * → 3 * 5 = 15
  + → 2 + 15 = 17
```

### 2. Terminal Expressions

Leaf nodes (no children):

```javascript
class NumberExpression {
  constructor(value) {
    this.value = parseFloat(value);
  }
  
  interpret() {
    return this.value;  // Just return value
  }
}

class VariableExpression {
  constructor(name) {
    this.name = name;
  }
  
  interpret(context) {
    return context[this.name];  // Lookup in context
  }
}
```

### 3. Nonterminal Expressions

Composite nodes (have children):

```javascript
class OperationExpression {
  constructor(operator, operands) {
    this.operator = operator;
    this.operands = operands;  // Child expressions
  }
  
  interpret(context) {
    // Recursively interpret operands
    const values = this.operands.map(op => op.interpret(context));
    
    // Apply operator
    return this.applyOperator(this.operator, values);
  }
}
```

### 4. Tokenization

Convert string to tokens:

```javascript
Input: "(+ 2 (* x 5))"

Tokenize: ['(', '+', '2', '(', '*', 'x', '5', ')', ')']

Nested structure:
['+', '2', ['*', 'x', '5']]
```

### 5. Parsing

Convert tokens to AST:

```javascript
Tokens: ['+', '2', ['*', 'x', '5']]

Parse:
OperationExpression('+', [
  NumberExpression(2),
  OperationExpression('*', [
    VariableExpression('x'),
    NumberExpression(5)
  ])
])
```

### 6. Interpretation

Evaluate AST with context:

```javascript
expression.interpret({ x: 3 })
  ↓
OperationExpression('+').interpret()
  ↓
1. Interpret operands:
   - NumberExpression(2).interpret() → 2
   - OperationExpression('*').interpret()
     → VariableExpression('x').interpret() → 3
     → NumberExpression(5).interpret() → 5
     → Apply '*': 3 * 5 = 15
  ↓
2. Apply '+': 2 + 15 = 17
  ↓
Result: 17
```

## Implementation Variants

### 1. Classical OOP (1-classes.js)

Traditional Gang of Four with abstract classes:

```javascript
// Abstract base class
class Expression {
  interpret(context) {
    throw new Error('Abstract method');
  }
}

// Terminal expression
class NumberExpression extends Expression {
  interpret(context) {
    return this.value;
  }
}

// Nonterminal expression
class OperationExpression extends Expression {
  interpret(context) {
    const values = this.operands.map(op => op.interpret(context));
    return this.applyOperator(values);
  }
}

// Parser and Tokenizer as classes
class Parser {
  static parse(tokens) { /* ... */ }
}

class Tokenizer {
  constructor(source) {
    this.tokenize();
  }
}

// Evaluator coordinator
class Evaluator {
  evaluate(context) {
    const tokens = new Tokenizer(this.input);
    const expression = Parser.parse(tokens);
    return expression.interpret(context);
  }
}
```

**Characteristics:**
- ✅ Clear hierarchy (abstract → concrete)
- ✅ Type safety through inheritance
- ✅ Enforces expression interface
- ❌ More boilerplate
- ❌ Verbose class definitions

### 2. Simplified Functional (2-improved.js)

Streamlined with operators registry:

```javascript
// Operators as registry (not switch statement)
const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
};

// Expressions as simple classes (no abstract base)
class NumberExpression {
  interpret() { return this.value; }
}

class VariableExpression {
  interpret(context) { return context[this.name]; }
}

class OperationExpression {
  interpret(context) {
    const values = this.operands.map(op => op.interpret(context));
    const operator = OPERATORS[this.operator];
    return values.reduce(operator);
  }
}

// Functional tokenize/parse (not classes)
const tokenize = (source) => { /* ... */ };
const parse = (tokens) => { /* ... */ };
const evaluate = (input, context) => {
  const tokens = tokenize(input);
  const expression = parse(tokens);
  return expression.interpret(context);
};
```

**Improvements:**
- ✅ Operators registry (extensible)
- ✅ Functional tokenize/parse
- ✅ No abstract class overhead
- ✅ Simpler to extend
- ✅ More JavaScript-idiomatic

### 3. Extended Language (3-extended.js)

Adds more operators (Lisp-like):

```javascript
const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  'eq': (a, b) => a === b,         // Equality
  'list': (...items) => items,     // Create list
  'car': (list) => list[0],        // First element (head)
  'cdr': (list) => list.slice(1),  // Rest (tail)
};
```

**Features:**
- ✅ Extended operator set
- ✅ List operations (Lisp-inspired)
- ✅ Boolean operations
- ✅ Easy to add more operations

## Language Being Interpreted

This implementation interprets a Lisp-like language:

```lisp
; Arithmetic
(+ 2 3)           ; 2 + 3 = 5
(* 4 5)           ; 4 * 5 = 20
(- 10 3)          ; 10 - 3 = 7
(/ 20 4)          ; 20 / 4 = 5

; Nested expressions
(+ 2 (* 3 4))     ; 2 + (3 * 4) = 14
(* (+ 1 2) (- 5 3))  ; (1 + 2) * (5 - 3) = 6

; Variables
(+ x y)           ; x + y (from context)
(* price quantity)

; Comparison (extended)
(eq 3 3)          ; true
(eq x y)          ; compare variables

; Lists (extended)
(list 1 2 3)      ; [1, 2, 3]
(car (list 7 3 1))  ; 7 (first element)
(cdr (list 7 3 1))  ; [3, 1] (rest)
```

## Real-World Use Cases

### 1. **Expression Evaluators**

Business rule engines:

```javascript
// Business rules
const rules = [
  "(> price 100)",
  "(< quantity 50)",
  "(eq status 'active')"
];

const context = { price: 150, quantity: 30, status: 'active' };
const results = rules.map(rule => evaluate(rule, context));
// [true, true, true]
```

### 2. **Configuration DSLs**

Configuration language:

```javascript
// Config language
const config = `
  (if (eq env 'production')
    (set timeout 30000)
    (set timeout 5000))
`;

evaluate(config, { env: 'production' });
// timeout = 30000
```

### 3. **Query Languages**

Simple query DSL:

```javascript
const query = "(filter (where (> price 100)) items)";
const context = {
  items: products,
  price: (item) => item.price
};
const result = evaluate(query, context);
```

### 4. **Template Engines**

Expression in templates:

```javascript
const template = "Hello {{ (+ firstName lastName) }}";
const context = { firstName: 'Marcus', lastName: 'Aurelius' };
// "Hello Marcus Aurelius"
```

### 5. **Mathematical Expressions**

Calculator/formula evaluator:

```javascript
const formula = "(/ (+ (price quantity) shipping) tax)";
const context = { price: 100, quantity: 3, shipping: 10, tax: 1.2 };
const total = evaluate(formula, context);
```

## Key Features

### 1. **Recursive Interpretation**

Expressions interpret recursively:

```javascript
interpret("(+ 2 (* 3 4))")
  ↓
OperationExpression('+').interpret()
  ↓
  NumberExpression(2).interpret() → 2
  OperationExpression('*').interpret()
    ↓
    NumberExpression(3).interpret() → 3
    NumberExpression(4).interpret() → 4
    ↓
    Apply '*': 3 * 4 = 12
  ↓
  Apply '+': 2 + 12 = 14
```

### 2. **Context-Based Evaluation**

Variables resolved from context:

```javascript
const expr = "(+ x (* y 2))";
const context = { x: 5, y: 3 };

interpret(expr, context)
  → x = 5 (from context)
  → y = 3 (from context)
  → (* 3 2) = 6
  → (+ 5 6) = 11
```

### 3. **Composable Expressions**

Build complex from simple:

```javascript
const add = new OperationExpression('+', [num1, num2]);
const multiply = new OperationExpression('*', [add, num3]);
const result = new OperationExpression('-', [multiply, num4]);

// Represents: (multiply - num4) where multiply = (num1 + num2) * num3
```

### 4. **Extensible Operations**

Add new operators easily:

```javascript
// Add modulo operator
OPERATORS['%'] = (a, b) => a % b;

// Add power operator
OPERATORS['**'] = (a, b) => a ** b;

// Add comparison
OPERATORS['>'] = (a, b) => a > b;

// Now can use:
evaluate("(% 10 3)", {})  // 1
evaluate("(** 2 8)", {})  // 256
evaluate("(> x 100)", { x: 150 })  // true
```

## Pattern Benefits

### 1. **DSL Creation**
Define custom languages for specific domains:
```javascript
// Financial DSL
"(if (> (balance account) 1000) (apply 'premium) (apply 'standard'))"

// Workflow DSL
"(sequence (validate data) (save data) (notify users))"
```

### 2. **Expression Trees**
Build and manipulate expression trees:
```javascript
const expr = parse("(+ x y)");
// Can inspect, optimize, transform before interpreting
```

### 3. **Runtime Evaluation**
Evaluate expressions at runtime with different contexts:
```javascript
const expr = "(* price quantity)";
evaluate(expr, { price: 10, quantity: 5 });  // 50
evaluate(expr, { price: 20, quantity: 3 });  // 60
```

### 4. **Testability**
Easy to test individual components:
```javascript
// Test tokenizer
expect(tokenize("(+ 2 3)")).toEqual(['+', '2', '3']);

// Test parser
const expr = parse(['+', '2', '3']);
expect(expr).toBeInstanceOf(OperationExpression);

// Test interpreter
expect(expr.interpret({})).toBe(5);
```

## When to Use

### ✅ Use Interpreter Pattern When:

1. **Simple grammar** to interpret
2. **Efficiency not critical** (interpretation is slower than compiled)
3. **Grammar changes frequently** (easier to modify interpreter than compiler)
4. **DSL needed** for domain-specific operations
5. **Runtime expression evaluation** required
6. **Composable expressions** beneficial

### ❌ Don't Use When:

1. **Complex grammar** (use parser generator instead)
2. **Performance critical** (interpretation overhead)
3. **Large-scale language** (build real compiler)
4. **Simple calculations** (use eval or Function constructor - with caution)
5. **Fixed operations** (direct method calls simpler)

## Implementation Architecture

### Tokenizer

Converts string to tokens:

```javascript
const tokenize = (source) => {
  // Add spaces around parens
  const spaced = source
    .replaceAll('(', ' ( ')
    .replaceAll(')', ' ) ');
  
  // Split on whitespace
  const tokens = spaced.trim().split(/\s+/);
  
  // Build nested structure
  const stack = [];
  const parentStack = [];
  let current = stack;
  
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

// Example:
tokenize("(+ 2 (* 3 4))")
// → ['+', '2', ['*', '3', '4']]
```

### Parser

Converts tokens to AST:

```javascript
const parse = (tokens) => {
  // Terminal: Not an array
  if (!Array.isArray(tokens)) {
    return isNaN(tokens)
      ? new VariableExpression(tokens)
      : new NumberExpression(tokens);
  }
  
  // Nonterminal: Array [operator, ...operands]
  const [operator, ...operands] = tokens;
  const expressions = operands.map(parse);  // Recursive
  return new OperationExpression(operator, expressions);
};

// Example:
parse(['+', '2', ['*', '3', '4']])
// → OperationExpression('+', [
//     NumberExpression(2),
//     OperationExpression('*', [
//       NumberExpression(3),
//       NumberExpression(4)
//     ])
//   ])
```

### Interpreter

Evaluates AST recursively:

```javascript
class Expression {
  interpret(context) {
    // Abstract - implemented by subclasses
  }
}

class OperationExpression {
  interpret(context) {
    // 1. Interpret all operands (recursive)
    const values = this.operands.map(op => op.interpret(context));
    
    // 2. Apply operator
    const operator = OPERATORS[this.operator];
    return values.reduce(operator);
  }
}
```

## Lisp-like Syntax

The examples use Lisp prefix notation:

```lisp
; Prefix notation (operator first)
(+ 2 3)           ; 2 + 3
(* 4 5)           ; 4 * 5
(+ 1 2 3 4)       ; 1 + 2 + 3 + 4

; vs Infix notation (operator between)
2 + 3
4 * 5
1 + 2 + 3 + 4

; Nested expressions
(+ 2 (* 3 4))     ; 2 + (3 * 4)
(* (+ 1 2) (- 5 3))  ; (1 + 2) * (5 - 3)

; Why prefix?
; - Unambiguous (no operator precedence)
; - Easy to parse (consistent structure)
; - Composable (everything is list)
; - No parentheses needed for precedence
```

## Pattern Evolution (Files)

### 1-classes.js - Classical OOP

```javascript
// Full OOP with abstract Expression
class Expression { /* abstract */ }
class NumberExpression extends Expression { }
class VariableExpression extends Expression { }
class OperationExpression extends Expression { }

// Class-based utilities
class Parser { static parse() { } }
class Tokenizer { constructor() { } }
class Evaluator { evaluate() { } }
```

**Characteristics:**
- Complete class hierarchy
- Abstract base class
- Validator in base class
- Separate Parser/Tokenizer/Evaluator classes

### 2-improved.js - Functional Hybrid

```javascript
// Simpler expression classes (no abstract base)
class NumberExpression { interpret() { } }
class VariableExpression { interpret(context) { } }
class OperationExpression { interpret(context) { } }

// Operators as registry
const OPERATORS = {
  '+': (a, b) => a + b,
  // ...
};

// Functional utilities
const tokenize = (source) => { };
const parse = (tokens) => { };
const evaluate = (input, context) => { };
```

**Improvements:**
- ✅ No abstract class
- ✅ Operators registry (extensible)
- ✅ Functional tokenize/parse
- ✅ Simpler API

### 3-extended.js - Extended Operations

```javascript
const OPERATORS = {
  // Arithmetic
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  
  // Comparison
  'eq': (a, b) => a === b,
  
  // List operations (Lisp-inspired)
  'list': (...items) => items,
  'car': (list) => list[0],       // Head
  'cdr': (list) => list.slice(1), // Tail
};
```

**Features:**
- ✅ Rich operator set
- ✅ Boolean operations
- ✅ List operations
- ✅ Lisp-like functionality

## Interpreter Pattern vs eval()

### Why Not Just Use eval()?

```javascript
// Using eval (DANGEROUS!)
const result = eval("2 + 3 * 4");  // 14

// Problems:
// ❌ Security risk (arbitrary code execution)
// ❌ No sandboxing
// ❌ Can access entire scope
// ❌ Can modify global state
// ❌ Hard to control what's allowed

// Interpreter Pattern (SAFE)
const result = evaluate("(+ 2 (* 3 4))", {});

// Benefits:
// ✅ Controlled operations (only what's in OPERATORS)
// ✅ Sandboxed (can only access context)
// ✅ Safe (no arbitrary code)
// ✅ Customizable syntax
// ✅ Easy to extend/modify
```

### When eval() is Acceptable

```javascript
// Mathematical expressions ONLY (still risky)
const mathExpr = "2 + 3 * 4";
if (/^[0-9+\-*/() ]+$/.test(mathExpr)) {
  const result = eval(mathExpr);
}

// Better: Use Function constructor with validation
const calculate = new Function('x', 'y', 'return x + y * 2');
const result = calculate(3, 4);  // 11
```

## GRASP Principles Applied

### Information Expert
Each expression knows how to interpret itself:
```javascript
class NumberExpression {
  interpret() { return this.value; }  // Has value, knows how to return it
}
```

### Polymorphism
Different expressions, same interface:
```javascript
expressions.map(expr => expr.interpret(context));  // Polymorphic
```

### Composite Pattern
Operations compose other expressions:
```javascript
class OperationExpression {
  constructor(operator, operands) {  // Composite
    this.operands = operands;  // Child expressions
  }
}
```

### Low Coupling
Context passed as parameter (not global):
```javascript
expression.interpret(context);  // Explicit dependency
```

## Anti-Patterns

### ❌ 1. Using eval()

```javascript
// BAD: Unsafe
const result = eval(userInput);  // Code injection risk!

// Good: Use interpreter
const result = evaluate(userInput, safeContext);
```

### ❌ 2. Hardcoded Operations

```javascript
// BAD: Switch for every operator
switch (operator) {
  case '+': return a + b;
  case '-': return a - b;
  // ...
}

// Good: Operators registry
const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
};
```

### ❌ 3. No Error Handling

```javascript
// BAD: No validation
interpret(context) {
  return context[this.name];  // What if undefined?
}

// Good: Validate
interpret(context) {
  if (!(this.name in context)) {
    throw new Error(`Variable "${this.name}" not defined`);
  }
  return context[this.name];
}
```

## Summary

The Interpreter Pattern enables creating custom languages and expression evaluators by building an Abstract Syntax Tree and recursively interpreting it.

### Key Takeaways:

1. **DSL Creation**: Define mini-languages for specific domains
2. **Three Phases**: Tokenize → Parse → Interpret
3. **AST**: Tree structure representing expression
4. **Recursive**: Composite expressions interpret children
5. **Context**: Environment with variable values
6. **Extensible**: Easy to add new operators
7. **Safe**: Controlled operations (vs eval)

### Pattern Components:

```
Input → Tokenizer → Tokens → Parser → AST → Interpreter → Result
        (String)    (Array)  (Tree)  (traverse)     (Value)
```

### Implementation Levels:

```
1-classes.js   → Full OOP (abstract classes, validators)
                 ↓
2-improved.js  → Functional hybrid (operators registry)
                 ↓
3-extended.js  → Extended (Lisp-like operations)
```

### Use Cases:

- Business rule engines
- Configuration languages
- Query languages  
- Template engines
- Mathematical expression evaluators
- Workflow definitions

The Interpreter Pattern is powerful for creating domain-specific languages but should be used judiciously - for complex languages, use proper parser generators (PEG.js, ANTLR, etc.) instead.