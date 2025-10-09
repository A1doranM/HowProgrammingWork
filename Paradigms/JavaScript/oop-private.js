/*
Paradigm: Object-Oriented Programming with Private State (#fields)

Summary:
- Uses private class fields (#x, #y) to strictly encapsulate state; only methods can access/modify it.
- Enforces invariants and information hiding better than public fields.

When to use:
- Libraries/APIs where consumers must not tamper with internal state.
- Domains with strong invariants or validation required on state changes.
- Codebases preferring class-based organization and robustness.

Trade-offs:
- Slightly more boilerplate than public fields; inspecting/debugging requires method access.
- Still mutable; if you need referential transparency, consider immutable/FP approaches.

Step-by-step in this code:
1) class Point with #x and #y: Declares private coordinates.
2) constructor(x, y): Initializes private fields.
3) move(dx, dy): Controlled in-class mutation of private state.
4) clone(): Produces a new Point with the same private values.
5) toString(): Exposes a safe, formatted view of the current state.
6) Execution flow:
   - Create p1, log; clone to c1; move c1; log.

Notes:
- External code cannot access or mutate #x/#y; improves safety and maintainability.
- Combine with validation inside methods to enforce domain rules.
*/
'use strict';

 // 1) Class with private fields (#x, #y) hiding internal state
class Point {
  #x;
  #y;

  // 2) Constructor initializes private fields
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  // 3) Controlled mutation through a method
  move(x, y) {
    this.#x += x;
    this.#y += y;
  }

  // 4) Clone creates a new instance with the same private values
  clone() {
    return new Point(this.#x, this.#y);
  }

  // 5) Safe formatter exposing state as a string (no direct field access)
  toString() {
    return `(${this.#x}, ${this.#y})`;
  }
}

// Usage

 // 6) Execution: instantiate, log, clone, mutate clone, log
const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
