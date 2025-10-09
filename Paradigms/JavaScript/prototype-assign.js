/*
Paradigm: Per-Instance Method Assignment (Object.assign) instead of Prototype Methods

Summary:
- Functions (clone, move, toString) are defined once and then assigned to each instance with Object.assign.
- This avoids using Point.prototype for method sharing; each instance receives its own method references.

When to use:
- Simple mixin-style composition or when you need to assign a selected subset of behaviors dynamically.
- Cases where prototypes are intentionally avoided for clarity or isolation.

Trade-offs:
- Higher memory usage per instance (each instance keeps its own method references).
- Methods are not shared via the prototype chain; dynamic changes to the original functions after assignment won’t propagate to existing instances unless reassigned.
- Tooling and performance often favor prototype methods for large numbers of instances.

Step-by-step in this code:
1) clone(): Creates a new Point from this.x and this.y.
2) move(dx, dy): Mutates this by adding deltas to coordinates.
3) toString(): Formats this.x and this.y.
4) Point(x, y): Initializes instance fields and assigns methods via Object.assign (no prototype).
5) Execution:
   - Instantiate p1; log; clone to c1; move c1; log again.

Notes:
- Prefer prototype methods when many instances are created to reduce memory footprint.
- Per-instance assignment can be useful for object-level customization or feature toggling.
*/
'use strict';

 // 1) Method shared via function + per-instance assignment
const clone = function () {
  return new Point(this.x, this.y);
};

 // 2) Mutating method updates the current instance (this)
const move = function (x, y) {
  this.x += x;
  this.y += y;
};

 // 3) Formatting method reads fields from the current instance
const toString = function () {
  return `(${this.x}, ${this.y})`;
};

 // 4) Constructor initializes fields and assigns methods per-instance via Object.assign
function Point(x, y) {
  this.x = x;
  this.y = y;
  // Assign method references onto this instance (no prototype used)
  Object.assign(this, { clone, move, toString });
}

// Usage

 // 5) Execution: instantiate, log, clone, mutate clone, log
const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
