'use strict';

const listp = (list) => Array.isArray(list) && list.length > 0;
const head = (list) => list[0];
const tail = (list) => list.slice(1);

const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  eq: (a, b) => a === b,
  list: (...list) => (listp(list) ? list : null),
  car: (list) => (listp(list) ? head(list) : null),
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

// Usage

{
  const program = '(+ 2 (* x 5) (- y 2))';
  const context = { x: 3, y: 7 };
  const result = evaluate(program, context);
  const expected = 2 + 3 * 5 + (7 - 2);
  console.log({ program, expected, result });
}

{
  const program = '(eq 3 3)';
  const result = evaluate(program, {});
  const expected = true;
  console.log({ program, expected, result });
}

{
  const program = '(eq 3 4)';
  const result = evaluate(program, {});
  const expected = false;
  console.log({ program, expected, result });
}

{
  const program = '(list 7 3 1)';
  const result = evaluate(program, {});
  const expected = [7, 3, 1];
  console.log({ program, expected, result });
}

{
  const program = '(car (list 7 3 1)';
  const result = evaluate(program, {});
  const expected = 7;
  console.log({ program, expected, result });
}

{
  const program = '(cdr (list 7 3 1)';
  const result = evaluate(program, {});
  const expected = [3, 1];
  console.log({ program, expected, result });
}
