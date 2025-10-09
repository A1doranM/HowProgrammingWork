/*
Paradigm: OOP with Static Methods (Utility-style Operations on Instances)

Summary:
- Instance holds data; operations are exposed as static methods on the class.
- Encourages a namespaced, utility style where functions are grouped by domain type.

When to use:
- You want clear grouping of related operations without binding behavior to instance 'this'.
- Functional tendencies inside an OOP namespace (methods accept objects explicitly).
- Utility libraries where operations work on passed-in instances or plain objects.

Trade-offs:
- Weaker encapsulation than instance methods (no private access via this).
- Static methods can encourage procedural usage; invariants must be enforced manually.
- Discoverability can be split between instance and static APIs; be consistent.

Step-by-step in this code:
1) class Point: Instances carry x and y as public fields.
2) constructor(x, y): Initializes instance data; no behavior bound to 'this'.
3) Point.move(point, dx, dy): Static mutator; modifies the given instance.
4) Point.clone(point): Static factory; creates a new instance from an existing point.
5) Point.toString(point): Static formatter; returns string view of a point.
6) Execution:
   - Create p1; format with Point.toString.
   - Clone to c1; move c1 via Point.move; format again.

Notes:
- Prefer instance methods if you need invariants/encapsulation via private fields or accessors.
- Static API mirrors a procedural style but stays organized under a type name.
*/
'use strict';

 // 1) Class with instance data; operations provided as static methods
class Point {
  // 2) Instance holds data only; behavior lives in static utility methods
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // 3) Static mutator modifies provided instance
  static move(point, x, y) {
    point.x += x;
    point.y += y;
  }

  // 4) Static factory returns a new instance from existing state
  static clone({ x, y }) {
    return new Point(x, y);
  }

  // 5) Static formatter; no need for instance 'this'
  static toString({ x, y }) {
    return `(${x}, ${y})`;
  }
}

// Usage

 // 6) Execution: instantiate; call static methods passing instances explicitly
const p1 = new Point(10, 20);
console.log(Point.toString(p1));
const c1 = Point.clone(p1);
Point.move(c1, -5, 10);
console.log(Point.toString(c1));
