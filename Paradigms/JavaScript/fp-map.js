/*
Paradigm: Functor-style Mapping over a Container

Summary:
- Encapsulates a value in a simple container exposing map, enabling declarative transformations.
- Each map applies a pure function to the internal value and returns the function’s result (or a new container).

When to use:
- Build pipelines where data is transformed step-by-step without mutating the original.
- Encourage small, testable pure functions and explicit data flow.
- Model computation contexts (values inside containers) that can be mapped over.

Trade-offs:
- Indirection via containers can confuse if overused; keep container contracts clear.
- Ensure functions are pure; side effects inside map break reasoning guarantees.

Step-by-step in this code:
1) createPoint(x)(y): Curried constructor returning a container with map(f) → f({ x, y }).
2) move(dx)(dy): Curried transformer that returns a function from {x,y} to a new container createPoint(x+dx)(y+dy).
3) clone({x,y}): Lifts a plain point into the container with createPoint(x)(y).
4) toString({x,y}): Pure formatter producing a string.
5) Execution:
   - p1.map(toString) prints the current coordinates.
   - c0 = p1.map(clone) re-wraps the point in a new container; format it.
   - c1 = p1.map(move(-5)(10)) transforms to a shifted container; format it.

Notes:
- This is a minimal “functor-like” pattern; real functors preserve structure and laws.
- Combine with pipe/compose and currying for expressive functional pipelines.
*/
'use strict';

 // 1) Curried constructor: returns a container exposing map over { x, y }
const createPoint = (x) => (y) => ({ map: (f) => f({ x, y }) });
 // 2) Curried transformer: returns a function mapping a point to a shifted container
const move = (dx) => (dy) => ({ x, y }) => createPoint(x + dx)(y + dy);
 // 3) Lift a plain { x, y } into the container
const clone = ({ x, y }) => createPoint(x)(y);
 // 4) Pure formatter (no side effects)
const toString = ({ x, y }) => `(${x}, ${y})`;

// Usage

 // 5) Execution: create a container with coordinates
const p1 = createPoint(10)(20);
console.log(p1.map(toString));
 // 6) Clone by mapping into a new container
const c0 = p1.map(clone);
console.log(c0.map(toString));
 // 7) Move by mapping a curried transformer to produce a shifted container
const c1 = p1.map(move(-5)(10));
console.log(c1.map(toString));
