/*
Paradigm: Hybrid — Class with Closure-based Return (constructor returns a closure-backed object)

Summary:
- Mixes class syntax (for fields/methods) with closure-based encapsulation by returning a new object
  from the constructor that closes over 'this'. The returned object becomes the instance.
- Demonstrates how closures can expose a minimal API (clone, toString) while internal state lives on 'this'.

When to use:
- Very rarely; primarily as a teaching example. Prefer either:
  - Pure class-based encapsulation (use private fields/#, instance methods), or
  - Pure closure/factory style (return an object literal with all behaviors).
- If you need to hide some methods and expose a restricted interface.

Trade-offs and caveats:
- If a constructor returns an object, that object replaces the usual instance. Prototype methods (like move)
  on Point.prototype are NOT present on the returned object unless explicitly added.
- This hybrid can confuse users and tooling (e.g., instanceof, prototypes, IDE hints).
- Prefer consistency (class OR factory) unless you have a compelling reason.

Step-by-step in this code:
1) class Point: constructor assigns this.x and this.y and defines two closures:
   - clone: returns a new Point snapshot using current this.x and this.y
   - toString: formats current coordinates
   The constructor returns { clone, toString }, replacing the instance with a minimal API object.
2) move(dx, dy): A prototype method that mutates this.x and this.y. Note: the returned object from the
   constructor does NOT inherit this method (see caveat above).
3) Usage flow:
   - p1 = new Point(10, 20) yields an object with { clone, toString }.
   - p1.toString() works; p1.clone() returns another { clone, toString } object.
   - Calling c1.move(...) would normally fail because move is not on the returned object’s prototype.

Notes:
- To actually use move in this hybrid, you would need to either avoid returning a different object
  from the constructor, or include move in the returned object too. This file illustrates the pitfall.
*/
'use strict';

 // 1) Class whose constructor returns a closure-backed minimal API object
class Point {
  constructor(ax, ay) {
    this.x = ax;
    this.y = ay;
    // Define closure-based API that reads from current 'this'
    const clone = () => new Point(this.x, this.y);
    const toString = () => `(${this.x}, ${this.y})`;
    // Replace the usual instance with a minimal object (prototype methods won’t be present)
    return { clone, toString };
  }

  // 2) Prototype method mutating state; NOT available on the returned object above
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}

// Usage

 // 3) Execution: build object with { clone, toString } interface
const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
 // Note: c1.move is not defined in this pattern; this call would fail in a real runtime
// c1.move(-5, 10);
console.log(c1.toString());
