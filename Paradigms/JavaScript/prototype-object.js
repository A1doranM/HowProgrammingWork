/*
Paradigm: Prototypal OOP with an Explicit Prototype Object (Object.create)

Summary:
- Defines a shared prototype object (PointPrototype) containing methods.
- Instances are created via Object.create(PointPrototype), delegating method lookups to it.
- Methods are shared across all instances (memory-efficient, dynamic augmentation possible).

When to use:
- Lightweight object modeling without classes/constructors.
- Need fine-grained control over the prototype chain and property descriptors.
- Prefer delegation and shared behavior with minimal ceremony.

Trade-offs:
- Discoverability may be lower than class syntax; team familiarity matters.
- this-binding rules still apply for methods; ensure correct call sites.
- Mutability remains; use immutability if you need referential transparency.

Step-by-step in this code:
1) PointPrototype: Object literal containing shared methods move, clone, toString.
2) move(dx, dy): Mutates the receiving object (this) by the provided deltas.
3) clone(): Creates a new delegated object with own x,y set via property descriptors (writable).
4) toString(): Formats current coordinates for display.
5) createPoint(x, y): Factory that builds an instance delegating to PointPrototype and initializes data.
6) Execution:
   - p1 = createPoint(10, 20); log.
   - c1 = p1.clone(); mutate c1 via move(-5, 10); log.

Notes:
- Using Object.create with a literal prototype gives flexibility (e.g., null-prototype variants).
- Property descriptors in clone allow control over writability/enumerability if needed.
*/
'use strict';

 // 1) Shared prototype object holding methods delegated by instances
const PointPrototype = {
  // 2) Shared mutator: adjust receiver's coordinates by deltas
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  },
  // 3) Shared clone: create a new instance delegating to the same prototype
  clone() {
    return Object.create(PointPrototype, {
      x: { value: this.x, writable: true },
      y: { value: this.y, writable: true },
    });
  },
  // 4) Shared formatter: return string representation of current coordinates
  toString() {
    return `(${this.x}, ${this.y})`;
  },
};

 // 5) Factory: create an object delegating to PointPrototype and initialize data
const createPoint = (x, y) => {
  const point = Object.create(PointPrototype);
  point.x = x;
  point.y = y;
  return point;
};

// Usage

 // 6) Execution: create, format, clone, move clone, format again
const p1 = createPoint(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
