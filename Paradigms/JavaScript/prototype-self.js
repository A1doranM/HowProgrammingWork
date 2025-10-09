/*
Paradigm: Prototypal OOP via Shared Prototype Object + Factory

Summary:
- Uses an explicit shared prototype object (proto) and a factory (createPoint) that returns objects
  delegating to this prototype. Methods live on proto and are shared by all instances.
- Avoids class/constructor ceremony; gives direct control over the prototype chain.

When to use:
- Lightweight object creation with shared behavior and no classes.
- Need fine-grained control over the prototype chain (e.g., Object.create with a null prototype).
- Memory efficiency: share methods across instances instead of per-instance methods.

Trade-offs:
- this-binding rules still apply in methods; ensure calls preserve the correct receiver.
- Discoverability can be lower than classes for some teams.
- Using a null-prototype proto means no inherited Object.prototype methods (by design).

Step-by-step in this code:
1) proto = Object.create(null): Create a method holder with no Object.prototype on its chain.
2) createPoint(x, y): Factory that creates an object delegating to proto and initializes data fields.
3) proto.clone(): Returns a new object via createPoint with the same coordinates.
4) proto.move(dx, dy): Mutates the receiving instance (this) by deltas.
5) proto.toString(): Formats current coordinates.
6) Execution:
   - p1 = createPoint(10, 20); log; clone to c1; move c1; log.

Notes:
- With a null-prototype, methods like toString must be defined explicitly; nothing is inherited.
- Prefer classes if your team favors that syntax; behavior is ultimately similar (delegation to a prototype).
*/
'use strict';

 // 1) Shared prototype object (no Object.prototype on the chain)
const proto = Object.create(null);

 // 2) Factory returns an object whose [[Prototype]] is `proto` and initializes fields
const createPoint = (x, y) => {
  const self = Object.create(proto);
  self.x = x;
  self.y = y;
  return self;
};

 // 3) Shared method: create a new instance with identical coordinates
proto.clone = function () {
  return createPoint(this.x, this.y);
};

 // 4) Shared method: mutate receiver by deltas
proto.move = function (x, y) {
  this.x += x;
  this.y += y;
};

 // 5) Shared method: format current coordinates
proto.toString = function () {
  return `(${this.x}, ${this.y})`;
};

// Usage

 // 6) Execution: create, log, clone, mutate clone, log
const p1 = createPoint(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
