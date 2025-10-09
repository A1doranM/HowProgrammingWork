/*
Paradigm: Closure-based Monads (map/chain via factory, Applicative via pointTransform)

Summary:
- Uses closures to encapsulate state and expose monad-like operations:
  - map: apply a pure transformation and return a new container (re-wrapped).
  - chain/flatMap: pass values to a function that returns a container (no extra wrapping).
- pointTransform is an Applicative-like wrapper with ap to apply a stored function to a point container.
- serialized is a tiny container to demonstrate mapping over a computed result.

When to use:
- Compose transformations over domain data while keeping state private via closures.
- Build declarative, testable pipelines using Functor/Monad/Applicative patterns without classes.
- Keep public surface minimal and immutable-by-convention.

Trade-offs:
- Abstractions add cognitive load; may be overkill for simple flows.
- Must maintain discipline around purity and container semantics.

Step-by-step in this code:
1) createPoint(x, y): Factory returning a monad-like container with map and chain (state hidden in closure).
2) map(fn): Applies fn(x, y) → { x, y }, re-wraps with createPoint.
3) chain(fn): Calls fn(x, y) and returns its container directly (no re-wrapping).
4) pointTransform(fn): Applicative-like wrapper exposing ap(point) → point.map(fn).
5) serialized(data): Minimal container with map for fluent handling of results (e.g., logging).
6) Helpers: move (curried), clone (pure), toString (returns serialized for mapping).
7) Execution: create, format/log, clone, apply transform via ap, then format/log again.
*/
'use strict';

 // 1) Closure-based monad-like container with map/chain over (x, y)
const createPoint = (x, y) => {
  const map = (fn) => {
    const coord = fn(x, y);
    return createPoint(coord.x, coord.y);
  };
  const chain = (fn) => fn(x, y);
  return { map, chain };
};

 // 4) Applicative-like wrapper: apply stored fn to a point via map
const pointTransform = (fn) => ({ ap: (point) => point.map(fn) });
 // 5) Minimal container for results; enables fluent map over computed data
const serialized = (data) => ({ map: (fn) => fn(data) });

 // 6) Pure helpers
const move = (dx, dy) => (x, y) => ({ x: x + dx, y: y + dy });
const clone = (x, y) => ({ x, y });
const toString = (x, y) => serialized(`(${x}, ${y})`);

// Usage

 // 7) Execution: construct, format/log, clone, transform via applicative, format/log
const p1 = createPoint(10, 20);
p1.chain(toString).map(console.log);
const c0 = p1.map(clone);
const t1 = pointTransform(move(-5, 10));
const c1 = t1.ap(c0);
c1.chain(toString).map(console.log);
