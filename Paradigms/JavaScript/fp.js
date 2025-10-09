/*
Paradigm: Functional Programming (Immutable Data, Pure Functions)

Summary:
- Treats data as immutable; functions return new values instead of mutating inputs.
- Emphasizes purity (no side effects), referential transparency, and composability.

When to use:
- Predictable data flows, concurrency safety, and ease of testing.
- Transformations/pipelines where chaining small pure functions is beneficial.
- Systems that value correctness and reasoning over implicit state changes.

Trade-offs:
- More allocations (new objects for each transformation) can impact performance.
- Requires diligence to avoid hidden side effects (I/O, global state).

Step-by-step in this code:
1) createPoint(x, y): Returns a frozen object to discourage mutation.
2) move({x,y}, dx, dy): Returns a new point with updated coordinates (no mutation).
3) clone(point): Returns a new point with the same coordinates.
4) toString(point): Pure formatter of the current coordinates.
5) Execution flow:
   - Create p1; log.
   - Clone to c0; log.
   - Move p1 to produce c1; log. (p1 remains unchanged due to immutability)

Notes:
- Object.freeze provides shallow immutability; nested structures require deeper strategies.
- Consider structural sharing (e.g., persistent data structures) for performance.
*/
'use strict';

 // 1) Create an immutable point (frozen object)
const createPoint = (x, y) => Object.freeze({ x, y });
 // 2) Pure transformation: return a new point without mutating inputs
const move = ({ x, y }, dx, dy) => createPoint(x + dx, y + dy);
 // 3) Pure clone: new object with identical values
const clone = (point) => createPoint(point.x, point.y);
 // 4) Pure formatter (no side effects)
const toString = (point) => `(${point.x}, ${point.y})`;

// Usage

 // 5) Execution: create, log, clone & log, move & log (original remains unchanged)
const p1 = createPoint(10, 20);
console.log(toString(p1));
const c0 = clone(p1);
console.log(toString(c0));
const c1 = move(p1, -5, 10);
console.log(toString(c1));
