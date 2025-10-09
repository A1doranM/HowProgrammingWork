/*
Paradigm: Domain-Specific Monads via Factory Functions (Functor/Monad + Applicative)

Summary:
- Implements a monad-like container Point with map (Functor) and chain/flatMap (Monad) using factory functions.
- Provides an Applicative-like PointTransform with ap to apply a stored function over a Point.
- Uses a simple Serialized container to demonstrate mapping over a computed result (e.g., logging/formatting).

When to use:
- Compose transformations over domain data declaratively while keeping core logic pure and testable.
- Inject and combine functions (transforms) using Functor/Monad/Applicative patterns without classes.
- Prefer minimal, closure-based containers with explicit APIs.

Trade-offs:
- Abstraction adds terminology and indirection; can be overkill for simple flows.
- Requires discipline around purity and consistent container contracts (map/chain/ap).
- Without TypeScript, payload shapes are by convention.

Step-by-step in this code:
1) Point({x,y}): Factory returning a container with:
   - map(fn): Applies fn({x,y}) -> {x,y} and rewraps in a new Point (Functor).
   - chain(fn): Calls fn({x,y}) and returns its container directly (Monad).
2) Point.of({x,y}): Lifts a plain coordinate object into the Point container (Applicative constructor).
3) PointTransform(fn): Applicative-like wrapper exposing ap(point) to apply fn via point.map.
4) Serialized(data): Minimal container with map for fluent handling of results (e.g., logging).
5) Helpers: move (curried), clone (pure), toString (returns Serialized for mapping).
6) Execution:
   - p1 = Point.of({x:10,y:20}); chain(toString).map(console.log) formats/logs.
   - c0 = p1.map(clone); t1 = new PointTransform(move(...)); c1 = t1.ap(c0);
   - c1.chain(toString).map(console.log) formats/logs the moved point.

Notes:
- Point.map returns a new Point; Point.chain allows functions to return other containers (like Serialized).
- Real-world monads include Promise (then), Maybe/Either, Task/IO, etc.
*/
'use strict';

 // 1) Domain container: Functor/Monad implemented via factory functions
function Point({ x, y }) {
  // Functor map: apply fn to coords and rewrap in Point
  const map = (fn) => {
    const coord = fn({ x, y });
    return new Point({ x: coord.x, y: coord.y });
  };
  // Monad chain/flatMap: delegate to fn that returns a container
  const chain = (fn) => fn({ x, y });
  return { map, chain };
}

 // 2) Applicative constructor to lift plain coords into a Point
Point.of = ({ x, y }) => new Point({ x, y });

 // 3) Applicative-like wrapper to apply a stored function over a Point
function PointTransform(fn) {
  const ap = (point) => point.map(fn);
  return { ap };
}

 // 4) Minimal container to demonstrate fluent mapping of results (e.g., console.log)
function Serialized(data) {
  const map = (fn) => fn(data);
  return { map };
}

 // 5) Pure helpers
const move = (d) => ({ x, y }) => ({ x: x + d.x, y: y + d.y });
const clone = ({ x, y }) => ({ x, y });
const toString = ({ x, y }) => new Serialized(`(${x}, ${y})`);

// Usage

 // 6) Execution: construct, format/log, clone, transform via applicative, format/log again
const p1 = Point.of({ x: 10, y: 20 });
p1.chain(toString).map(console.log);
const c0 = p1.map(clone);
const t1 = new PointTransform(move({ x: -5, y: 10 }));
const c1 = t1.ap(c0);
c1.chain(toString).map(console.log);
