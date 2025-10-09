/*
Paradigm: Functional Pattern Matching (Tagged Unions / Algebraic Data Types)

Summary:
- Represents values as tagged variants (e.g., { tag: 'point', ... }) and dispatches behavior
  by matching on the tag. This simulates algebraic data types and pattern matching in JS.
- Keeps transformation logic centralized and explicit via handler tables.

When to use:
- Modeling domain values with distinct variants (Some/None, Ok/Err, Point/Circle/etc.).
- Replacing if/else or switch chains with a declarative dispatch table.
- Making it obvious which variants are handled (and which are missing).

Trade-offs:
- No exhaustiveness checks without tooling; missing handlers cause runtime errors.
- Requires discipline to keep handler tables in sync with variants.
- Slight overhead of explicit tags and tables, but gains clarity.

Step-by-step in this code:
1) match(variant, handlers): Dispatch function that selects a handler by variant.tag and calls it.
2) createPoint(x, y): Constructs an immutable (frozen) tagged value { tag: 'point', x, y }.
3) move(instance, dx, dy): Matches on instance to create a new moved point (no mutation).
4) clone(instance): Matches on instance to return a copy.
5) toString(instance): Matches on instance to format a string.
6) Execution:
   - Build p1; format and log.
   - Clone to c0; format and log.
   - Move p1 immutably to c1; format and log.

Notes:
- Extendable: add new variants (e.g., 'point3d') with corresponding handlers.
- Consider TypeScript discriminated unions for compile-time checks.
*/
'use strict';

 // 1) Dispatcher: pick handler by tag and invoke with the full variant
const match = (variant, handlers) => handlers[variant.tag](variant);

 // Implementation (tagged constructors and match-based operations)
// Implementation

 // 2) Tagged constructor returning an immutable value
const createPoint = (x, y) => Object.freeze({ tag: 'point', x, y });

 // 3) Move: match on variant and return a new shifted point (no mutation)
const move = (instance, dx, dy) =>
  match(instance, {
    point: ({ x, y }) => createPoint(x + dx, y + dy),
  });

 // 4) Clone: match and reconstruct a new point with same payload
const clone = (instance) =>
  match(instance, {
    point: ({ x, y }) => createPoint(x, y),
  });

 // 5) Formatter: match and produce a string representation
const toString = (instance) =>
  match(instance, {
    point: ({ x, y }) => `(${x}, ${y})`,
  });

// Usage

 // 6) Execution: create, format/log, clone/format, move/format
const p1 = createPoint(10, 20);
console.log(toString(p1));
const c0 = clone(p1);
console.log(toString(c0));
const c1 = move(p1, -5, 10);
console.log(toString(c1));
