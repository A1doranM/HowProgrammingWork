/*
Paradigm: Functional Composition and Currying (Point-free style)

Summary:
- Builds programs by composing small pure functions. Data flows through a pipeline (pipe/compose).
- Uses currying to create partially applied functions and point-free expressions.
- Demonstrates a functor-like container (object with map) to sequence transformations declaratively.

When to use:
- You want predictable, testable transformations with minimal hidden state.
- Complex pipelines that benefit from small reusable steps and composition.
- Situations where you want to separate “what to do” (functions) from “when to run” (piping).

Trade-offs:
- Heavily curried/point-free code may be less approachable to newcomers.
- Excessive small functions can hamper debugging; keep names and boundaries clear.

Step-by-step in this code:
1) pipe(...fns): Left-to-right function composition; passes the result of each fn to the next.
2) createPoint(x)(y): Curried constructor that returns a functor-like container exposing map.
3) move(dx)(dy): Curried transformer that returns a function from {x,y} to a new createPoint(x+dx)(y+dy).
4) clone({x,y}): Lifts a plain point into the container with createPoint(x)(y).
5) toString({x,y}): Pure formatter for display.
6) Usage:
   - p1 = createPoint(10)(20); p1.map(toString) logs string form.
   - operations = pipe(clone, move(-5)(10), toString); p1.map(operations) applies the pipeline.

Notes:
- The container’s map defers execution and encourages declarative sequencing.
- Consider libraries like Ramda or utility helpers to standardize pipe/compose across codebases.
*/
'use strict';

 // 1) Left-to-right composition: pipe(f, g, h)(x) === h(g(f(x)))
const pipe = (...fns) => (obj) => fns.reduce((val, f) => f(val), obj);

 // 2) Implementation primitives (curried constructors and transformations)
 //    Container exposes map to apply a function to { x, y } and return its result
// Implementation

 // 3) Curried constructor returning a functor-like container with map
const createPoint = (x) => (y) => ({ map: (f) => f({ x, y }) });
 // 4) Curried transformer: returns a function that moves a point immutably
const move = (dx) => (dy) => ({ x, y }) => createPoint(x + dx)(y + dy);
 // 5) Lift a plain {x,y} into the container
const clone = ({ x, y }) => createPoint(x)(y);
 // 6) Pure formatter (no side effects)
const toString = ({ x, y }) => `(${x}, ${y})`;

// Usage

 // 7) Execution: construct a container and map a formatter over it
const p1 = createPoint(10)(20);
console.log(p1.map(toString));
 // 8) Build a reusable pipeline: clone → move by (-5,+10) → format
const operations = pipe(clone, move(-5)(10), toString);
 // 9) Apply the pipeline to the container via map
p1.map(operations);
