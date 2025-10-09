/*
Paradigm: Fully Curried Functional Style (Single-argument mapping)

Summary:
- Models data and transformations with fully curried functions. The "container" returned by createPoint
  exposes a map method that expects a fully curried function f such that f(x)(y) returns a result.
- Encourages point-free programming and strong separation of data (curried arguments) from behavior.

When to use:
- You want maximal composability with currying/partial application and a very small abstraction footprint.
- Building pipelines over small, pure pieces where arity-1 steps are convenient to compose.
- Teaching/experimenting with Church-encoded or curried encodings of data transformations.

Trade-offs:
- Can be harder to read for engineers unfamiliar with currying and higher-order encodings.
- Debugging and type inference (without TS) are more challenging with deeply curried functions.
- Overuse may hinder discoverability; balance with clearer, less curried alternatives where appropriate.

Step-by-step in this code:
1) createPoint(x)(y): Returns a container object with map(f) that computes f(x)(y).
2) move(dx)(dy)(x)(y): Fully curried transformer that produces a new container createPoint(x+dx)(y+dy).
3) clone = createPoint: Lifts captured x,y back into a new point container.
4) toString(x)(y): Curried formatter that turns coordinates into a string.
5) Execution:
   - p1 = createPoint(10)(20); p1.map(toString) → "..." (formats).
   - c0 = p1.map(clone) → new container; format it.
   - c1 = p1.map(move(-5)(10)) → shifted container; format it.

Notes:
- map here applies functions of shape f :: x -> y -> result (fully curried).
- This is a minimal “functor-like” structure focused on composition rather than data mutation.
*/
'use strict';

 // 1) Curried constructor returning a container with map(f) → f(x)(y)
const createPoint = (x) => (y) => ({ map: (f) => f(x)(y) });
 // 2) Fully curried transformer producing a new container with shifted coords
const move = (dx) => (dy) => (x) => (y) => createPoint(x + dx)(y + dy);
 // 3) Clone by re-lifting captured values into a new container
const clone = createPoint;
 // 4) Curried formatter (no side effects)
const toString = (x) => (y) => `(${x}, ${y})`;

// Usage

 // 5) Execution: construct, format, clone & format, move & format
const p1 = createPoint(10)(20);
console.log(p1.map(toString));
const c0 = p1.map(clone);
console.log(c0.map(toString));
const c1 = p1.map(move(-5)(10));
console.log(c1.map(toString));
