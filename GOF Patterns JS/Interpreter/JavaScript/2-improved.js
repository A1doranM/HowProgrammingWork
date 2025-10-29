'use strict';

const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
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
    const args = this.operands.map(toValues);
    const operator = OPERATORS[this.operator];
    if (!operator) throw new Error(`Unknown operator: ${operator}`);
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
  const operandExpressions = operands.map(parse);
  return new OperationExpression(operator, operandExpressions);
};

const evaluate = (input, context = {}) => {
  const tokens = tokenize(input);
  console.log({ tokens });
  const expression = parse(tokens);
  return expression.interpret(context);
};

// Usage

const program = '(+ 2 (* x 5) (- y 2))';
const context = { x: 3, y: 7 };
const result = evaluate(program, context);
const expected = 2 + 3 * 5 + (7 - 2);
console.log({ expected, result });
