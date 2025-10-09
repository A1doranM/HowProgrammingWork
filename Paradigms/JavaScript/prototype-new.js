/*
Paradigm: Prototypal OOP via Factory + Explicit Prototype

Summary:
- Uses an explicit prototype object (proto) and a factory function that returns objects delegating to it.
- Demonstrates delegation without class syntax; methods live on proto and are shared by all instances.

When to use:
- Lightweight object creation with shared behavior and no class/constructor ceremony.
- Fine-grained control over the prototype chain (e.g., Object.create with a null prototype).
- Memory efficiency by sharing methods across instances.

Trade-offs:
- Using 'new' with a factory that returns its own object is unnecessary and can confuse readers.
- this-binding still applies in methods; ensure method calls preserve the correct receiver.
- Discoverability can be lower vs. classes; team familiarity matters.

Step-by-step in this code:
1) proto: An object with no prototype (Object.create(null)) that will hold shared methods.
2) Point(x, y): Factory that creates a new object whose [[Prototype]] is proto; assigns x,y; returns it.
3) proto.clone(): Creates a new object via Point with the same x,y (shares proto methods).
4) proto.move(dx, dy): Mutates the receiving object (this) by the provided deltas.
5) proto.toString(): Formats current coords for display.
6) Execution:
   - p1 = new Point(10, 20) (note: 'new' is superfluous; factory returns an object explicitly).
   - Log p1; clone to c1; move c1; log c1.

Notes:
- Because Point returns an object, calling it with or without 'new' yields the returned object; prefer Point(…) without 'new' for clarity.
- A null-prototype proto avoids inherited properties like toString from Object.prototype.
*/
'use strict';

 // 1) Shared behavior holder; no Object.prototype on the chain
const proto = Object.create(null);

 // 2) Factory creates an object delegating to proto and initializes data fields
function Point(x, y) {
  const self = Object.create(proto);
  self.x = x;
  self.y = y;
  return self;
}

 // 3) Shared method: return a new object with the same coordinates
proto.clone = function () {
  return new Point(this.x, this.y);
};

 // 4) Shared method: mutate this by deltas
proto.move = function (x, y) {
  this.x += x;
  this.y += y;
};

 // 5) Shared method: format current coordinates
proto.toString = function () {
  return `(${this.x}, ${this.y})`;
};

// Usage

 // 6) Execution: 'new' is not required since Point returns an object explicitly
const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
