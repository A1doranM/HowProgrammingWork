/*
Paradigm: IO Monad (deferring side effects) composed with a Domain Monad (Point) using inputs as objects

Summary:
- IO wraps effectful computations and defers execution until run() is called.
- Point is a domain container over an object { x, y } that supports of/map/chain for pure transformations.
- PointTransform is an Applicative-style wrapper providing ap to apply a stored function to a Point.
- The pipeline composes an effect layer (IO) with a pure layer (Point), passing coordinates as objects.

When to use:
- Keep effects at the boundary (IO.run) and maintain a pure, testable core for transformations.
- Build declarative pipelines over domain data with explicit, typed-like payloads ({ x, y }).
- Compose computations using Functor/Monad/Applicative patterns while keeping code readable.

Trade-offs:
- Adds abstraction; ensure where effects actually execute (run) is clear and intentional.
- Without static types, payload shapes are by convention; prefer TypeScript when possible.
- Overuse can obscure simple flows; apply where effect isolation and composition provide value.

Step-by-step in this code:
1) class IO: Effect container with of/map/chain/run; defers side effects until run().
2) class Point: Domain container over { x, y } with of/map/chain for immutable transformations.
3) class PointTransform: Applicative wrapper to apply a stored function via ap(point).
4) Helpers:
   - move(d): Curried transformer updating coordinates immutably using a delta object.
   - clone(p): Pure copier returning a fresh { x, y }.
   - toString(p): Returns an IO that formats the coordinates as a string.
5) Execution:
   - input: IO producing an initial Point.of({ x, y }).
   - First pipeline: format via toString (IO), then map(console.log) and run().
   - Second pipeline: clone in Point, apply a moved transform via ap, format again via IO, and run().

Notes:
- Keep IO.run at the program edge to isolate effects. Inside map/chain, stay pure when possible.
- map vs chain: map transforms inside the same container; chain sequences into the returned container.
*/
'use strict';

 // 1) Effect container: defers side effects until run()
class IO {
  #effect;

  // Store effect thunk (no execution on construction)
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

 // 2) Domain container over { x, y } with Functor/Monad capabilities
class Point {
  #x;
  #y;

  // Initialize private coordinates from object input
  constructor({ x, y }) {
    this.#x = x;
    this.#y = y;
  }

  // Applicative constructor: lift { x, y } into a Point container
  static of({ x, y }) {
    return new Point({ x, y });
  }

  // Functor map: apply fn({ x, y }) -> { x, y }; rewrap as Point
  map(fn) {
    const { x, y } = fn({ x: this.#x, y: this.#y });
    return Point.of({ x, y });
  }

  // Monad chain/flatMap: fn returns a container; do not rewrap here
  chain(fn) {
    return fn({ x: this.#x, y: this.#y });
  }
}

 // 3) Applicative-like wrapper around a function `(p: {x,y}) -> {x,y}`
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

 // 4) Pure helpers: curried move (delta object), pure clone, and IO-based formatter
const move = (d) => ({ x, y }) => ({ x: x + d.x, y: y + d.y });
const clone = ({ x, y }) => ({ x, y });
const toString = ({ x, y }) => IO.of(() => `(${x}, ${y})`);

// Usage

 // 5) Execution: IO produces initial Point; then sequence formatting and logs via IO
const input = IO.of(() => Point.of({ x: 10, y: 20 }));

 // Format via IO and log, then run
input.chain((point) => point.chain(toString))
  .map(console.log)
  .run();

 // Defer cloning inside IO by mapping over inner Point
const c0 = input.map((point) => point.map(clone));
 // Lift a transformer into an applicative wrapper
const t1 = new PointTransform(move({ x: -5, y: 10 }));
 // Apply wrapped function to the wrapped value (inside IO)
const c1 = c0.map((point) => t1.ap(point));

 // Format result through IO and log
c1.chain((point) => point.chain(toString))
  .map(console.log)
  .run();
