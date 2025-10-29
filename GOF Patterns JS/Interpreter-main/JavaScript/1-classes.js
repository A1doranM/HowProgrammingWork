'use strict';

class Expression {
  interpret(context) {
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === Expression) {
      throw new Error('Abstract interpret() must be implemented');
    }
    if (!context) {
      throw new Error('Argument "context" must be passed');
    }
  }
}

class NumberExpression extends Expression {
  constructor(value) {
    super();
    this.value = parseFloat(value);
  }

  interpret(context) {
    super.interpret(context);
    return this.value;
  }
}

class VariableExpression extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }

  interpret(context) {
    super.interpret(context);
    return context[this.name];
  }
}

class OperationExpression extends Expression {
  constructor(operator, operands) {
    super();
    this.operator = operator;
    this.operands = operands;
  }

  interpret(context) {
    const args = this.operands.map((operand) => operand.interpret(context));
    switch (this.operator) {
      case '+':
        return args.reduce((a, b) => a + b, 0);
      case '-':
        return args.reduce((a, b) => a - b);
      case '*':
        return args.reduce((a, b) => a * b, 1);
      case '/':
        return args.reduce((a, b) => a / b);
      default:
        throw new Error(`Unknown operator: ${this.operator}`);
    }
  }
}

class Parser {
  static parse(tokens) {
    if (!Array.isArray(tokens)) {
      return isNaN(tokens)
        ? new VariableExpression(tokens)
        : new NumberExpression(tokens);
    }
    const [operator, ...operands] = tokens;
    const operandExpressions = operands.map(Parser.parse);
    return new OperationExpression(operator, operandExpressions);
  }
}

class Tokenizer {
  constructor(source) {
    this.source = source;
    this.stack = [];
    this.tokenize();
    return this.stack[0];
  }

  tokenize() {
    const parentStack = [];
    let current = this.stack;

    const tokens = this.source
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
  }
}

class Evaluator {
  constructor(input) {
    this.input = input;
  }

  evaluate(context = {}) {
    const tokens = new Tokenizer(this.input);
    console.log({ tokens });
    const expression = Parser.parse(tokens);
    return expression.interpret(context);
  }
}

// Usage

const program = '(+ 2 (* x 5) (- y 2))';
const context = { x: 3, y: 7 };
const evaluator = new Evaluator(program, context);
const result = evaluator.evaluate(context);
const expected = 2 + 3 * 5 + (7 - 2);
console.log({ expected, result });
