/*
Paradigm: Monads (Functor, Monad, Applicative patterns)

Summary:
- A Monad is a pattern for sequencing computations with context (e.g., values, errors, async).
- Core operations:
  - map (Functor): apply a function to the wrapped value and re-wrap the result.
  - chain/flatMap (Monad): like map, but avoids double-wrapping by expecting the function to return a container.
  - ap (Applicative): apply a wrapped function to a wrapped value.

When to use:
- Structure effectful pipelines (e.g., async, optional values, validation) while keeping composition explicit.
- Decouple transformation steps from plumbing and error/edge-case handling.
- Make side effects explicit (via IO/Task monads) or model context (Maybe/Either).

Trade-offs:
- Adds abstractions and terminology; can be overkill for simple flows.
- Requires discipline to keep functions pure and respect container semantics.

Step-by-step in this code:
1) class Monad: Holds a private value and provides of, map, chain, and ap.
2) of(value): Lifts a plain value into the monad.
3) map(fn): Clones internal value, applies fn, rewraps with of (Functor).
4) chain(fn): Clones internal value, passes it to fn that itself returns a container (Monad).
5) ap(container): Treats this monad as a function, and maps it over another container (Applicative).
6) move(d): Curried transformer that immutably moves a point by delta.
7) clone(p): Pure clone of a point.
8) toString(p): Returns a monad with formatted coordinates (demonstrates returning a container).
9) Execution: Build p1; chain(toString) → log; map(clone); lift move into a monad; ap to apply; chain(toString) → log.

Notes:
- structuredClone is used to avoid mutating internal state passed to user functions.
- Real-world monads include Promise (then), Array (flatMap), and user-defined Maybe/Either/Task.
*/
'use strict';

 // 1) Generic container for sequencing computations; holds a private value
class Monad {
  #value;

  // Initialize with a value (could be any type)
  constructor(value) {
    this.#value = value;
  }

  // 2) Applicative constructor: lift a value into the monad
  static of(value) {
    return new Monad(value);
  }

  // 3) Functor map: apply fn to a cloned inner value and rewrap the result
  map(fn) {
    // Clone to avoid exposing internal reference and accidental mutation
    const value = structuredClone(this.#value);
    return Monad.of(fn(value));
  }

  // 4) Monad chain/flatMap: fn returns a container; avoid extra wrapping
  chain(fn) {
    // Clone before passing to user-provided function
    const value = structuredClone(this.#value);
    return fn(value);
  }

  // 5) Applicative ap: this contains a function; apply it to another container's value
  ap(container) {
    const fn = this.#value;
    return container.map(fn);
  }
}

 // 6) Curried move: returns a function that adds delta immutably
const move = (d) => ({ x, y }) => ({ x: x + d.x, y: y + d.y });
 // 7) Pure clone (no mutation)
const clone = ({ x, y }) => ({ x, y });
 // 8) Formatter that returns a Monad-wrapped string to demonstrate chain
const toString = ({ x, y }) => Monad.of(`(${x}, ${y})`);

// Usage

 // 9) Execution: wrap a point; chain to format and map to log
const p1 = Monad.of({ x: 10, y: 20 });
p1.chain(toString).map(console.log);
 // Clone inside the monad (Functor map)
const c0 = p1.map(clone);
 // Lift a function into the monad (Applicative)
const t1 = Monad.of(move({ x: -5, y: 10 }));
 // Apply wrapped function to wrapped value
const c1 = t1.ap(c0);
 // Format result and log
c1.chain(toString).map(console.log);
