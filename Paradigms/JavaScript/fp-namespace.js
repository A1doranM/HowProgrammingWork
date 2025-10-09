/*
Paradigm: Functional Namespace Module

Summary:
- Groups a set of pure, stateless functions under a single namespace object (point).
- Encourages immutability and referential transparency (no internal mutable state or this usage).

When to use:
- Utility-style modules, data transformations, and small libraries where objects don’t need identity.
- Tree-shakable codebases where individual functions may be imported or referenced easily.
- Domains that benefit from simple, explicit parameter passing over hidden state.

Trade-offs:
- No encapsulation or invariants enforced by the module itself; callers must pass valid data.
- Namespacing can grow large; consider splitting by responsibility to avoid "god module" anti-patterns.
- Without types, payload shapes are by convention; consider TS for compile-time checks.

Step-by-step in this code:
1) point.create(x, y): Returns an immutable point (Object.freeze) to discourage mutation.
2) point.move({x, y}, dx, dy): Returns a new point with updated coordinates (pure, no mutation).
3) point.clone({x, y}): Returns a new point with the same values via point.create.
4) point.toString({x, y}): Pure formatter for display.
5) Execution:
   - Create p1; log.
   - Clone to c0; log.
   - Move p1 immutably to produce c1; log.

Notes:
- Since objects are frozen only shallowly, deeply nested structures may need deep-freezing or persistent data structures.
- Prefer small focused namespaces to keep discoverability high.
*/
'use strict';

 // 1) Functional module (namespace) exposing pure operations over point data
const point = {
  create: (x, y) => Object.freeze({ x, y }),
  move: ({ x, y }, dx, dy) => ({ x: x + dx, y: y + dy }),
  clone: ({ x, y }) => point.create(x, y),
  toString: ({ x, y }) => `(${x}, ${y})`,
};

// Usage

 // 5) Execution: create, log, clone & log, move & log (original remains unchanged)
const p1 = point.create(10, 20);
console.log(point.toString(p1));
const c0 = point.clone(p1);
console.log(point.toString(c0));
const c1 = point.move(p1, -5, 10);
console.log(point.toString(c1));
