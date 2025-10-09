/*
Paradigm: Closure-based Encapsulation with Internal Struct

Summary:
- Encapsulates state inside a local object (self) that is closed over by returned functions.
- Exposes a focused API ({ move, clone, toString }) while keeping raw state private.

When to use:
- You want strict data privacy without classes/prototypes.
- Prefer a small, explicit public surface and simple lexical scoping.
- Good for small modules/components where 'this' and inheritance add little value.

Trade-offs:
- Each instance creates new closures (slightly higher per-instance overhead).
- Mutation occurs within the closure; consider immutability (return new objects) if needed.
- No prototype sharing of methods; each instance has its own function objects.

Step-by-step in this code:
1) createPoint(x, y): Creates a local struct self = { x, y } as private state.
2) move(dx, dy): Mutates self by applying deltas.
3) clone(): Returns a new closure-backed point using the current snapshot of self.
4) toString(): Pure formatter over private state.
5) Execution:
   - p1 = createPoint(10, 20); log string.
   - c1 = p1.clone(); mutate c1 via move(-5, 10); log string.

Notes:
- External code can’t access self directly; only the returned API can read/change it.
- This style contrasts with prototypal/class OOP where behavior is shared via prototypes.
*/
'use strict';

 // 1) Factory creates a closure with private state stored in 'self'
const createPoint = (x, y) => {
  const self = { x, y };
  // 2) Mutate private state by deltas
  const move = (dx, dy) => {
    self.x += dx;
    self.y += dy;
  };
  // 3) Snapshot clone: produce a new closure-backed point with current coords
  const clone = () => createPoint(self.x, self.y);
  // 4) Pure formatter reading private state
  const toString = () => `(${self.x}, ${self.y})`;
  return { move, clone, toString };
};

// Usage

 // 5) Execution: create, format, clone, move clone, format again
const p1 = createPoint(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
