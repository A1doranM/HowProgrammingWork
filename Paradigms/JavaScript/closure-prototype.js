/*
Paradigm: Closure-based Encapsulation via Factory-like Constructor

Summary:
- Uses lexical closures to keep internal state (x, y) private and returns an object exposing a small API.
- Although the function is named Point and invoked with 'new', it returns a plain object; no prototype is used.

When to use:
- Need strict data privacy without classes or prototypes.
- Prefer factory style with a focused public surface ({ move, clone, toString }).
- Avoid 'this'/prototype mechanics, relying on lexical scope instead.

Trade-offs:
- Calling with 'new' is unnecessary and can confuse readers (the returned object is not a prototype instance).
- Each instance creates fresh closures; slightly higher per-instance memory than shared prototype methods.
- Mutation still happens inside the closure; consider immutability if needed.

Step-by-step in this code:
1) Point(ax, ay): Captures x and y in a closure; returns an API object, not a prototype-based instance.
2) move(dx, dy): Mutates the closed-over x and y by the provided deltas.
3) clone(): Constructs a new closure-backed object with the current snapshot of x and y.
4) toString(): Formats the current closed-over coordinates.
5) Usage:
   - new Point(10, 20) returns a closure-backed object with move/clone/toString.
   - Clone, mutate the clone, and format to string.

Notes:
- 'new' is not needed here because Point returns an object explicitly; calling Point(…) would work the same.
- This style contrasts with prototypal/class OOP where behavior is shared via prototypes.
*/
'use strict';

 // 1) Factory-style constructor capturing private (x, y) via closure; returns an API object
function Point(ax, ay) {
  let x = ax;
  let y = ay;
  // 2) Mutator: update closed-over state by deltas
  const move = (dx, dy) => {
    x += dx;
    y += dy;
  };
  // 3) Clone: produce a new closure-backed object with current snapshot
  const clone = () => new Point(x, y);
  // 4) Formatter: read private state and format string
  const toString = () => `(${x}, ${y})`;
  // Expose a minimal API; private state remains inaccessible externally
  return { move, clone, toString };
}

// Usage

 // 5) Execution: 'new' is superfluous since Point returns an object explicitly
const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
