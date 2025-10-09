/*
Paradigm: Domain-Specific Monads (Point as Functor/Monad, PointTransform as Applicative)

Summary:
- Demonstrates monadic composition tailored to a specific domain type (Point).
- Point implements:
  - map (Functor) to transform inner coordinates and rewrap them,
  - chain/flatMap (Monad) to hand control to a function returning a container.
- PointTransform implements:
  - ap (Applicative) to apply a wrapped function over a Point container.
- Serialized acts like a simple side-effect/result container with a fluent map.

When to use:
- You want to express dataflow pipelines over a domain value while separating the plumbing.
- Need to compose transformations, inject functions, and keep code testable and declarative.
- Modeling computations that may later carry more context (logging, validation, etc.).

Trade-offs:
- Adds abstraction/terminology; may be overkill for simple flows.
- Requires discipline to keep functions pure and to respect container semantics.

Step-by-step in this code:
1) class Point: monad-like container over (x, y) with of, map, chain.
2) class PointTransform: applicative wrapper with ap to apply a function to a Point.
3) class Serialized: minimal container to demonstrate mapping over results.
4) Helpers: move is curried; clone is pure; toString creates a Serialized from (x, y).
5) Execution:
   - Create p1; chain(toString) → map(console.log).
   - Clone with map; lift move into PointTransform; ap to apply; chain(toString) → log.

Notes:
- Point.map returns a new Point; Point.chain allows returning another container.
- This is a didactic example; real-world monads include Promise (then), Maybe/Either, Task/IO, etc.
*/
'use strict';

 // 1) Domain-specific monad-like container for points
class Point {
  #x;
  #y;

  // Initialize private state
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  // Applicative constructor: lift coords into Point container
  static of(x, y) {
    return new Point(x, y);
  }

  // Functor map: apply fn(x,y) -> { x, y }; rewrap with Point.of
  map(fn) {
    const { x, y } = fn(this.#x, this.#y);
    return Point.of(x, y);
  }

  // Monad chain/flatMap: fn returns a container; do not rewrap here
  chain(fn) {
    return fn(this.#x, this.#y);
  }
}

 // 2) Applicative-like wrapper around a function of (x, y)
class PointTransform {
  // Store the transformation function
  constructor(fn) {
    this.fn = fn;
  }

  // Applicative ap: apply stored fn to a Point via map
  ap(point) {
    return point.map(this.fn);
  }
}

 // 3) Simple result container to demonstrate fluent mapping over outputs
class Serialized {
  #data;

  // Hold serialized string value
  constructor(data) {
    this.#data = data;
  }

  // Execute fn on stored data and return this (fluent interface)
  map(fn) {
    fn(this.#data);
    return this;
  }
}

 // 4) Curried move: returns a function to move coordinates immutably by (dx, dy)
const move = (dx, dy) => (x, y) => ({ x: x + dx, y: y + dy });
 // Pure clone of coordinates
const clone = (x, y) => ({ x, y });
 // Return a Serialized container with formatted coordinates
const toString = (x, y) => new Serialized(`(${x}, ${y})`);

// Usage

 // 5) Execution: construct, format/log, clone, transform via applicative, then format/log
const p1 = Point.of(10, 20);
 // Chain to produce a Serialized, then map to log it
p1.chain(toString).map(console.log);
 // Clone coordinates inside Point via Functor map
const c0 = p1.map(clone);
 // Lift a transformer into PointTransform applicative
const t1 = new PointTransform(move(-5, 10));
 // Apply wrapped function to the wrapped value
const c1 = t1.ap(c0);
 // Format final point and log
c1.chain(toString).map(console.log);
