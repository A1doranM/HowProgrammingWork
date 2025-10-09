/*
Paradigm: Functional Programming with Currying

Summary:
- Currying transforms a function of multiple arguments into a sequence of unary functions.
- Enables partial application: you can provide fewer arguments now and the rest later, creating reusable, specialized functions.

When to use:
- Building pipelines from small, reusable functions.
- Configuring operations up front (e.g., provide dx, dy once) and applying them many times later.
- Improving composability and readability in FP-heavy codebases.

Trade-offs:
- Point-free and heavily curried code can be less approachable to newcomers.
- Debugging partially applied functions requires good naming and structure.

Step-by-step in this code:
1) curry(fn): Generic currying helper that returns a function accepting args until arity is met.
2) createPoint: Curried constructor; returns an immutable (frozen) point.
3) move: Curried transformer; takes a point and deltas, returns a new point (no mutation).
4) clone: Curried copier; lifts an existing point into a new immutable point.
5) toString: Curried formatter; turns a point into its string form.
6) Execution:
   - Create p1 by partially applying createPoint(10)(20).
   - Clone to c0 and format.
   - Apply move to p1 in stages: move(p1)(-5)(10), then format.

Notes:
- Currying simplifies reuse (e.g., const moveBy = move(point); const moveDownRight = moveBy(-5)(10)).
- Combine currying with composition (pipe/compose) for expressive pipelines.
*/
'use strict';

 // 1) Currying helper: collects arguments until fn.length is met, then invokes fn
const curry = (fn) => (...args) => args.length >= fn.length
  ? fn(...args)
  : (...rest) => curry(fn)(...args, ...rest);

 // 2) Implementation (curried constructors and transformations)
// Implementation

 // 3) Curried constructor producing an immutable point
const createPoint = curry((x, y) => Object.freeze({ x, y }));
 // 4) Curried move: returns a new point (no mutation)
const move = curry(({ x, y }, dx, dy) => createPoint(x + dx)(y + dy));
 // 5) Curried clone: lift an existing point into a new immutable point
const clone = curry((point) => createPoint(point.x)(point.y));
 // 6) Curried formatter: produce string form of a point
const toString = curry((point) => `(${point.x}, ${point.y})`);

// Usage

 // 7) Execution: build, clone, move (partially), and format
const p1 = createPoint(10)(20);
console.log(toString(p1));
const c0 = clone(p1);
console.log(toString(c0));
const c1 = move(p1)(-5)(10);
console.log(toString(c1));
