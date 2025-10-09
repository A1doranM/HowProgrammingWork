/*
Paradigm: Closure-based Encapsulation

Summary:
- Uses lexical scope to keep internal state private; returns functions that close over it.
- Achieves data privacy and modularity without classes or prototypes.

When to use:
- Small stateful components, factories, and modules that require strict data privacy.
- Avoiding 'this' and prototype mechanics in favor of simple lexical scoping.
- Encapsulating invariants by limiting state access to a controlled API.

Trade-offs:
- Each instance creates new closures (slightly higher per-instance overhead).
- Mutability is still possible within the closure; consider immutability if needed.
- Debugging hidden state can be less straightforward than visible fields.

Step-by-step in this code:
1) createPoint(ax, ay): Captures x and y in a closure (private state).
2) move(dx, dy): Updates the closed-over x and y (internal mutation).
3) clone(): Produces a new independent closure with the current snapshot of x and y.
4) toString(): Reads the closed-over x and y and formats a string.
5) Execution flow:
   - Create p1 = createPoint(10, 20); log p1.toString().
   - Clone to c1 = p1.clone(); mutate c1 via c1.move(-5, 10); log c1.toString().

Notes:
- External code cannot directly access x and y; only the returned API can.
- This pattern is an alternative to classes for encapsulation and information hiding.
*/
'use strict';

 // 1) Factory creates a closure with private coordinates (x, y)
const createPoint = (ax, ay) => {
  let x = ax;
  let y = ay;
  // 2) Internal mutator updates closed-over state
  const move = (dx, dy) => {
    x += dx;
    y += dy;
  };
  // 3) Clone produces a new closure with the current snapshot of state
  const clone = () => createPoint(x, y);
  // 4) Pure formatter that reads private state without exposing it
  const toString = () => `(${x}, ${y})`;
  return { move, clone, toString };
};

// Usage

 // 5) Execution: create, log, clone, mutate clone, log
const p1 = createPoint(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
