/*
Paradigm: Domain Monad (Class-based) with Applicative Function Application

Summary:
- Point is a class-based container implementing:
  - map (Functor): transform inner coordinates and rewrap them,
  - chain/flatMap (Monad): delegate to a function that returns a container.
- PointTransform is an Applicative-style wrapper that applies a stored function to a Point (ap).
- Serialized is a minimal container to demonstrate mapping over computed output (e.g., logging/formatting).

When to use:
- Compose pure coordinate transformations declaratively while keeping core logic testable.
- Inject behavior (functions) and combine them using Functor/Monad/Applicative patterns.
- Prefer a class-based API surface over factory/closure variants.

Trade-offs:
- Extra abstractions/terminology may be overkill for simple flows.
- Requires discipline to maintain purity and respect container contracts.
- Without static typing for payloads, shapes are by convention.

Step-by-step in this code:
1) class Point: Monad-like container over { x, y } with private fields (#x, #y).
2) static of({ x, y }): Lift plain coords into the Point container (Applicative constructor).
3) map(fn): Apply fn({ x, y }) -> { x, y }, rewrap as Point (Functor).
4) chain(fn): Call fn({ x, y }) and return its container directly (Monad).
5) class PointTransform(fn): Applicative wrapper with ap(point) → point.map(fn).
6) class Serialized: Minimal container with map for fluent result handling.
7) Helpers: move (curried), clone (pure), toString (returns Serialized for mapping).
8) Execution:
   - p1 = Point.of({x:10,y:20}); chain(toString).map(console.log).
   - c0 = p1.map(clone); t1 = new PointTransform(move(...)); c1 = t1.ap(c0);
   - c1.chain(toString).map(console.log).

Notes:
- map returns a new Point; chain allows functions to return other containers (like Serialized).
- Real-world monads include Promise (then), Maybe/Either, Task/IO, etc.
*/
'use strict';

 // 1) Domain container: class-based Functor/Monad over { x, y }
class Point {
  #x;
  #y;

  // Initialize private coordinates
  constructor({ x, y }) {
    this.#x = x;
    this.#y = y;
  }

  // Applicative constructor: lift plain coords into Point container
  static of({ x, y }) {
    return new Point({ x, y });
  }

  // Functor map: apply fn({ x, y }) -> { x, y } and rewrap as Point
  map(fn) {
    const coords = { x: this.#x, y: this.#y };
    return Point.of(fn(coords));
  }

  // Monad chain/flatMap: fn returns a container; do not rewrap here
  chain(fn) {
    const coords = { x: this.#x, y: this.#y };
    return fn(coords);
  }
}

 // 2) Applicative wrapper storing a transform function
class PointTransform {
  // Store transformation function
  constructor(fn) {
    this.fn = fn;
  }

  // Apply stored function to a Point via map
  ap(point) {
    return point.map(this.fn);
  }
}

 // 3) Minimal result container to demonstrate fluent mapping (e.g., logging)
class Serialized {
  #data;

  // Hold formatted string result
  constructor(data) {
    this.#data = data;
  }

  // Map to perform side effects (like console.log) and keep chaining
  map(fn) {
    fn(this.#data);
    return this;
  }
}

 // 4) Pure helpers
const move = (d) => ({ x, y }) => ({ x: x + d.x, y: y + d.y });
const clone = ({ x, y }) => ({ x, y });
const toString = ({ x, y }) => new Serialized(`(${x}, ${y})`);

// Usage

 // 5) Execution: construct, format/log, clone, applicative apply, format/log
const p1 = Point.of({ x: 10, y: 20 });
p1.chain(toString).map(console.log);
const c0 = p1.map(clone);
const t1 = new PointTransform(move({ x: -5, y: 10 }));
const c1 = t1.ap(c0);
c1.chain(toString).map(console.log);
