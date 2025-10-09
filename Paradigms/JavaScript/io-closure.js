/*
Paradigm: IO via Closures combined with a Domain Monad and Applicative

Summary:
- IO is modeled as a closure-based container that defers side effects until run() is called.
- A domain-specific "Point" container provides map/chain for pure coordinate transformations.
- A "Transform" applicative provides ap to apply a stored function over a Point container.
- The example composes an effect layer (IO) with a pure transformation layer (Point) via closures.

When to use:
- Isolate side effects at the boundary while keeping core logic pure and testable.
- Build declarative pipelines over domain data and sequence/log effects in a controlled way.
- Prefer minimal abstractions without classes (closures as containers).

Trade-offs:
- Extra abstraction; keep run() invocation sites clear to avoid confusion.
- Overuse can make simple flows harder to follow; apply where effect isolation helps.
- Without types, ensure consistent shapes for functions and containers.

Step-by-step in this code:
1) createIO(effect): Closure-based IO container with map/chain/run; defers execution.
2) createPoint(x, y): Closure-based container with map/chain over coordinates (pure transformations).
3) createTransform(fn): Applicative wrapper exposing ap(point) to apply fn via point.map.
4) move(dx, dy): Curried pure transformer; cloneP: pure copy; toString: returns IO formatting string.
5) Execution:
   - p1 = createPoint(10, 20); p1.chain(toString).map(console.log).run() logs via IO.
   - c0 = p1.map(cloneP); t1 = createTransform(move(...)); c1 = t1.ap(c0).
   - c1.chain(toString).map(console.log).run() logs the moved point.
*/
'use strict';

 // 1) IO effect container via closures: defer side effects until run()
const createIO = (effect) => ({
  map: (fn) => createIO(() => fn(effect())),
  chain: (fn) => createIO(() => fn(effect()).run()),
  run: () => effect(),
});

 // 2) Domain container (Point) over (x, y) with map/chain (pure)
const createPoint = (x, y) => ({
  map: (fn) => {
    const coord = fn(x, y);
    return createPoint(coord.x, coord.y);
  },
  chain: (fn) => fn(x, y),
});

 // 3) Applicative wrapper: apply stored function to a Point via map
const createTransform = (fn) => ({
  ap: (point) => point.map(fn),
});

 // 4) Pure helpers: curried move, clone, and a formatter that returns IO
const move = (dx, dy) => (x, y) => ({ x: x + dx, y: y + dy });
const cloneP = (x, y) => ({ x, y });
const toString = (x, y) => createIO(() => `(${x}, ${y})`);

// Usage

 // 5) Execution: log via IO, then clone, transform via applicative, and log again
const p1 = createPoint(10, 20);
p1.chain(toString).map(console.log).run();

const c0 = p1.map(cloneP);
const t1 = createTransform(move(-5, 10));
const c1 = t1.ap(c0);

c1.chain(toString).map(console.log).run();
