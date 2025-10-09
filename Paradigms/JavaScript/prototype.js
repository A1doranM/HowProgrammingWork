/*
Paradigm: Prototypal Object-Oriented Programming

Summary:
- Objects delegate to other objects via the prototype chain for method/behavior sharing.
- Methods are stored on the prototype so all instances share a single function implementation.

When to use:
- Lightweight OOP where you want to avoid class syntax and favor delegation.
- Dynamic augmentation/monkey-patching of behavior at runtime by modifying prototypes.
- Memory efficiency: share methods across many instances.

Trade-offs:
- this-binding pitfalls; forgetting 'new' can lead to bugs.
- Less explicit than classes for some teams; discoverability may be lower.
- Prototype mutations affect all instances; be cautious with global impact.

Step-by-step in this code:
1) Point(x, y): Constructor function initializes per-instance fields (this.x, this.y).
2) Point.prototype.clone: Shared method that creates a new Point copying state.
3) Point.prototype.move: Shared method mutating instance state by deltas.
4) Point.prototype.toString: Shared method formatting current coordinates.
5) Execution flow:
   - Create p1 = new Point(10, 20); log p1.toString().
   - Clone to c1; mutate c1 via move(-5, 10); log c1.toString().

Notes:
- Methods live on Point.prototype, so instances have small footprints and share behavior.
- Prefer classes for clearer syntax if your team is more comfortable with them (it compiles to similar prototype mechanics).
*/
'use strict';

 // 1) Constructor function assigns per-instance fields (delegation happens via prototype)
function Point(x, y) {
  this.x = x;
  this.y = y;
}

 // 2) Shared clone method lives on the prototype (one function shared by all instances)
Point.prototype.clone = function () {
  return new Point(this.x, this.y);
};

 // 3) Shared move method mutates the receiving instance (this)
Point.prototype.move = function (x, y) {
  this.x += x;
  this.y += y;
};

 // 4) Shared toString formatter reads current instance state
Point.prototype.toString = function () {
  return `(${this.x}, ${this.y})`;
};

// Usage

 // 5) Execution: instantiate, log, clone, mutate clone, log
const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
