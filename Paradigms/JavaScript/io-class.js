/*
Paradigm: IO Monad (deferring side effects) combined with a domain-specific Monad (Point)

Summary:
- IO wraps effectful computations and defers execution until run() is called.
- Point is a domain container implementing Functor (map) and Monad (chain) to compose pure transformations.
- PointTransform is an Applicative-style wrapper providing ap to apply a wrapped function to a Point.
- The example composes an effect layer (IO) with a pure transformation layer (Point).

When to use:
- Isolate side effects at the boundary (IO.run) while keeping core transformations pure and testable.
- Build declarative pipelines over domain data (Point) and sequence/log effects (IO).
- Compose computations in a principled way (Functor/Monad/Applicative patterns).

Trade-offs:
- Extra abstraction; debugging requires understanding when effects execute (only at run()).
- Overuse for simple tasks adds boilerplate; use judiciously on effectful or complex flows.

Step-by-step in this code:
1) class IO: Effect container; of lifts an effect; map/chain compose effects lazily; run executes.
2) class Point: Domain container over (x, y); of/map/chain enable pure transformations.
3) class PointTransform: Applicative wrapper; ap applies a stored function to a Point via map.
4) Helpers: move/clone are pure; toString returns an IO that formats coordinates.
5) Execution:
   - p1 = Point.of(10, 20)
   - p1.chain(toString).map(console.log).run() defers formatting/logging to IO boundary.
   - c0 = p1.map(clone) clones point purely.
   - t1.ap(c0) applies a curried move to c0.
   - Finally, toString → log via IO and run().

Notes:
- IO keeps effects explicit and controlled; keep run() at the program edge.
- Point map/chain do not mutate; they return new containers, aiding testability and reasoning.
*/
'use strict';

 // 1) Effect container: defers side effects until run()
class IO {
  #effect;

  // Store the effect thunk (no execution on construction)
  constructor(effect) {
    this.#effect = effect;
  }

  // Lift an effect function into an IO container
  static of(effect) {
    return new IO(effect);
  }

  // Map: transform the result of the effect, still deferred
  map(fn) {
    return new IO(() => fn(this.#effect()));
  }

  // Chain: sequence effects (fn returns IO); run inner later
  chain(fn) {
    return new IO(() => fn(this.#effect()).run());
  }

  // Execute the stored effect and return its result
  run() {
    return this.#effect();
  }
}

 // 2) Domain container implementing Functor/Monad over (x, y)
class Point {
  #x;
  #y;

  // Initialize private coordinates
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  // Applicative constructor: lift coords into a Point container
  static of(x, y) {
    return new Point(x, y);
  }

  // Functor map: apply fn(x, y) -> { x, y }; rewrap as Point
  map(fn) {
    const { x, y } = fn(this.#x, this.#y);
    return Point.of(x, y);
  }

  // Monad chain/flatMap: fn returns a container; do not rewrap here
  chain(fn) {
    return fn(this.#x, this.#y);
  }
}

 // 3) Applicative-like wrapper around a function of (x, y)
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

 // 4) Pure helpers
const move = (dx, dy) => (x, y) => ({ x: x + dx, y: y + dy });
const clone = (x, y) => ({ x, y });
 // toString returns an IO effect that formats coordinates lazily
const toString = (x, y) => IO.of(() => `(${x}, ${y})`);

// Usage

 // 5) Execution: construct, format/log via IO, clone, transform, and log again
const p1 = Point.of(10, 20);
 // Chain to IO(toString), map to log, and run effect at the boundary
p1.chain(toString).map(console.log).run();
 // Clone coordinates inside Point (pure)
const c0 = p1.map(clone);
 // Lift a curried move transformer into an applicative wrapper
const t1 = new PointTransform(move(-5, 10));
 // Apply wrapped function to wrapped value
const c1 = t1.ap(c0);
 // Format final point and log via IO
c1.chain(toString).map(console.log).run();
