/* 
Paradigm: Procedural Programming

Summary:
- Organizes logic as procedures (functions) that operate on plain data structures.
- Data and behavior are separate; mutation is common and state is passed explicitly.

When to use:
- Small utilities/scripts with linear, predictable flow.
- Performance-sensitive paths where minimal abstraction is desired.
- Educational examples demonstrating data + procedure separation.

Avoid or be cautious when:
- Complex domains that benefit from encapsulation and invariants (prefer OOP or closures).
- You want referential transparency, strong testability, and simple reasoning about state (prefer FP/immutability).

Step-by-step in this code:
1) createPoint(x, y): Builds a plain object record with { x, y }.
2) clone(point): Returns a new independent copy using createPoint.
3) move(point, dx, dy): Mutates point in place by adding deltas (procedural update).
4) toString(point): Pure formatting helper; no side effects.
5) Execution flow:
   - Create p1 = createPoint(10, 20); log it via toString.
   - Create c1 = clone(p1); move(c1, -5, 10); log c1. p1 stays unchanged.

Notes:
- Mutation vs copying: move mutates; clone avoids aliasing.
- Extensibility: Adding a new field (e.g., z) requires touching multiple procedures (typical in procedural style).
*/
'use strict';

 // 1) Construct a point record with given coordinates (separate data from behavior)
const createPoint = (x, y) => {
  const point = { x, y };
  return point;
};

 // 2) Create an independent copy of a point (avoid aliasing shared state)
const clone = (point) => {
  const { x, y } = point;
  return createPoint(x, y);
};

 // 3) Mutate an existing point by applying deltas (procedural in-place update)
const move = (point, x, y) => {
  point.x += x;
  point.y += y;
};

 // 4) Pure formatting helper (no mutation)
const toString = (point) => {
  const { x, y } = point;
  return `(${x}, ${y})`;
};

// Usage

 // 5) Execution: create a point, log it, then clone and move the clone
const p1 = createPoint(10, 20);
console.log(toString(p1));
const c1 = clone(p1);
move(c1, -5, 10);
console.log(toString(c1));
