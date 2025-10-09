/*
Paradigm: Aspect-Oriented Programming (AOP)

Summary:
- Extracts cross-cutting concerns (logging, metrics, tracing, caching, security) into reusable aspects.
- Wraps existing methods with before/after hooks without modifying the core business logic.

When to use:
- Apply uniform behaviors around many methods/classes without scattering duplicate code.
- Instrumentation (logging/metrics/tracing), validation, retries, caching decorators, security checks.
- Keep domain code focused while infrastructural concerns live in aspects.

Trade-offs:
- Indirection can obscure control flow; debugging may be harder if overused.
- Must preserve 'this', arguments, and return values; be careful not to swallow errors unintentionally.
- Over-wrapping can impact performance; measure critical paths.

Step-by-step in this code:
1) Point: Core domain class with move/clone/toString (no logging inside methods).
2) aspect(target, methodName, { before, after }): Higher-order function that replaces a method with a wrapper.
3) Wrapper behavior: calls before(...args) → original method → after(result, ...args), preserving 'this'.
4) aspect(Point.prototype, 'move', {...}): Adds before/after logs around move.
5) aspect(Point.prototype, 'clone', {...}): Adds after log showing the cloned instance.
6) Execution: Construct p1; clone to c1 (logs after); move c1 (logs before/after).

Notes:
- This is a manual AOP style via function wrapping; languages/frameworks may provide declarative AOP.
- Keep aspects side-effect-safe; avoid changing business logic outcomes unless intended (e.g., retries).
*/
'use strict';

 // 1) Core domain class; no logging inside (cross-cutting concerns added externally)
class Point {
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  // Mutates internal state (business logic only)
  move(x, y) {
    this.#x += x;
    this.#y += y;
  }

  // Returns a new instance (business logic only)
  clone() {
    return new Point(this.#x, this.#y);
  }

  // Pure formatter (business logic only)
  toString() {
    return `(${this.#x}, ${this.#y})`;
  }
}

 // 2) AOP helper: wrap target[methodName] with before/after hooks
const aspect = (target, methodName, { before, after }) => {
  const method = target[methodName];
  // 3) Wrapper preserves 'this', passes args, and forwards the result
  target[methodName] = function (...args) {
    before?.apply(this, args);
    const result = method.apply(this, args);
    after?.call(this, result, ...args);
    return result;
  };
};

 // 4) Add logging around move: before (old state + delta), after (new state)
aspect(Point.prototype, 'move', {
  before(x, y) {
    console.log(`Before move: ${this.toString()} moving by (${x},${y})`);
  },
  after() {
    console.log(`After move: ${this.toString()}`);
  },
});

 // 5) Add logging after clone: show cloned object's state
aspect(Point.prototype, 'clone', {
  after(result) {
    console.log(`After clone: ${result.toString()}`);
  },
});

// Usage

 // 6) Execution: create, clone (after log), then move (before/after logs)
const p1 = new Point(10, 20);
const c1 = p1.clone();
c1.move(-5, 10);
