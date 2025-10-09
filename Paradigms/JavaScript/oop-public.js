/*
Paradigm: Object-Oriented Programming (Public Fields)

Summary:
- Encapsulates related data and behavior inside a class; methods operate on instance state.
- Fields are public, so external code can read/write them directly.

When to use:
- Domain models with identity/invariants where behavior belongs next to data.
- When you need polymorphism and method dispatch on instances.
- Teams that prefer class-based organization and discoverability.

Trade-offs:
- Public fields weaken encapsulation (external code can bypass invariants).
- Prefer private fields or accessors if invariants must be enforced.
- Some patterns become “hidden” behind method calls; be mindful of side effects.

Step-by-step in this code:
1) class Point: Defines an object with x and y coordinates and related methods.
2) constructor(x, y): Initializes public fields this.x and this.y.
3) move(dx, dy): Mutates the instance by adding deltas to x and y.
4) clone(): Returns a new Point copying the current coordinates.
5) toString(): Returns a formatted string of the current coordinates.
6) Execution flow:
   - Create p1 = new Point(10, 20) and log p1.toString().
   - Clone to c1, mutate c1 via move(-5, 10), then log c1.toString().

Notes:
- Public fields are simple and fast but reduce invariants; use #private fields to harden encapsulation.
- Consider immutability (FP style) when you need referential transparency and easier testing.
*/
'use strict';

 // 1) Class encapsulating data and behavior (public fields)
class Point {
  // 2) Constructor initializes public fields
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // 3) Method mutates public state
  move(x, y) {
    this.x += x;
    this.y += y;
  }

  // 4) Clone creates a new instance with the same values
  clone() {
    return new Point(this.x, this.y);
  }

  // 5) Formatting method; no side effects
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

// Usage

 // 6) Execution: instantiate, log, clone, mutate clone, log
const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
