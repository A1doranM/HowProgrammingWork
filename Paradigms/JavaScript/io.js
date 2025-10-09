/*
Paradigm: IO Monad (deferring side effects) composed with a pure Monad

Summary:
- IO wraps effectful computations (functions) and defers execution until run() is called.
- map transforms the result of the effect without running it yet; chain sequences effects.
- A separate pure Monad models immutable transformations on values (map/chain/ap).
- This example composes IO (effect layer) with a pure Monad (data layer).

When to use:
- Isolate side effects (I/O, logging, timers) and keep core logic pure and testable.
- Build declarative pipelines where effect order is explicit and controlled.
- Compose multiple contexts (e.g., IO + validation + async) in a principled way.

Trade-offs:
- Adds abstraction; stepping through deferred effects can be less straightforward.
- Must design when and where run() is invoked to keep effect boundaries clear.
- Overuse can make simple code harder to follow; apply where benefits are clear.

Step-by-step in this code:
1) class IO: Holds an effect function; of lifts an effect; map/chain compose effects lazily; run executes.
2) class Monad: Pure container with of/map/chain/ap for immutable data transformation.
3) Helpers: move/clone are pure; toString returns an IO that formats a point (defers the side effect).
4) Execution:
   - input: IO wrapping a pure Monad.of({ x, y }).
   - Chain into monad to format via toString, then map(console.log) and run().
   - c0: Defer cloning inside IO by mapping clone over the inner monad.
   - c1: Lift move into Monad and ap(ply) it to the monadic point, all inside IO.
   - Finally, format/log again through IO and run().

Notes:
- structuredClone ensures map/chain in the pure Monad don’t mutate the inner value.
- IO.run is the only place where the effect actually executes; keep it at the boundary.
*/
'use strict';

 // 1) Effect container (IO): defers side effects until run()
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

 // 2) Pure container modeling value transformations (no side effects)
class Monad {
  #value;

  // Hold inner immutable value
  constructor(value) {
    this.#value = value;
  }

  // Lift a plain value
  static of(value) {
    return new Monad(value);
  }

  // Functor map: apply fn to a cloned value and rewrap
  map(fn) {
    const v = structuredClone(this.#value);
    return Monad.of(fn(v));
  }

  // Monad chain/flatMap: fn returns a container; no extra wrapping
  chain(fn) {
    const v = structuredClone(this.#value);
    return fn(v);
  }

  // Applicative ap: this holds a function; apply it to another container's value
  ap(container) {
    return container.map(this.#value);
  }
}

 // 3) Pure helpers
const move = (d) => ({ x, y }) => ({ x: x + d.x, y: y + d.y });
const clone = ({ x, y }) => ({ x, y });
 // toString returns an IO effect that formats the point lazily
const toString = ({ x, y }) => IO.of(() => `(${x}, ${y})`);

// Usage

 // 4) Execution: IO of a pure Monad with initial point
const input = IO.of(() => Monad.of({ x: 10, y: 20 }));

 // Format and log via IO: chain into monad → toString (IO) → map(console.log) → run()
input
  .chain((monad) => monad.chain(toString))
  .map(console.log)
  .run();

 // 5) Defer cloning inside IO by mapping over inner Monad
const c0 = input.chain((monad) => IO.of(() => monad.map(clone)));
 // 6) Lift move into Monad and apply (Applicative) to the monadic point, all inside IO
const c1 = c0.chain((monad) =>
  IO.of(() => Monad.of(move({ x: -5, y: 10 })).ap(monad)),
);

 // 7) Format the final point through IO and log
c1.chain((monad) => monad.chain(toString))
  .map(console.log)
  .run();
