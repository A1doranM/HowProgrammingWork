/*
Paradigm: Prototypal OOP with a Null Prototype (Object.create(null))

Summary:
- Uses a constructor function whose prototype is set to an object with no prototype (null).
- Instances delegate to this null-prototype object for shared methods.
- Eliminates inherited members from Object.prototype (e.g., toString, hasOwnProperty), giving a "dictionary-pure" prototype.

When to use:
- You need complete control over the prototype chain and want to avoid accidental collisions with Object.prototype keys.
- As a teaching/example of how prototypes and delegation work at a low level.
- Security-sensitive code paths where inherited properties must be prevented.

Trade-offs:
- You must provide all common methods (e.g., toString) yourself; nothing is inherited.
- Some libraries/utilities may expect Object.prototype features and break with null-prototype objects.
- Discoverability can be lower compared to class syntax; team familiarity matters.

Step-by-step in this code:
1) Point(x, y): Constructor assigns per-instance fields (this.x, this.y).
2) Point.prototype = Object.create(null): Replace the default prototype with a null-prototype object.
3) Point.prototype.clone: Shared method creating a new Point from current fields.
4) Point.prototype.move: Shared method mutating the receiving instance.
5) Point.prototype.toString: Shared method formatting current coordinates.
6) Execution:
   - p1 = new Point(10, 20); log; clone to c1; move c1; log.

Notes:
- With a null prototype, methods like toString are not available unless you define them explicitly.
- This pattern is useful for "plain dictionary" objects but can confuse code expecting normal objects.
*/
'use strict';

 // 1) Constructor function assigns per-instance fields (delegation happens via prototype)
function Point(x, y) {
  this.x = x;
  this.y = y;
}

 // 2) Use a null-prototype object to avoid inheriting from Object.prototype
Point.prototype = Object.create(null);

 // 3) Shared method: return a new Point with the same coordinates
Point.prototype.clone = function () {
  return new Point(this.x, this.y);
};

 // 4) Shared method: mutate this by the given deltas
Point.prototype.move = function (x, y) {
  this.x += x;
  this.y += y;
};

 // 5) Shared method: return a string representation (must be defined explicitly)
Point.prototype.toString = function () {
  return `(${this.x}, ${this.y})`;
};

// Usage

 // 6) Execution: instantiate, log, clone, mutate clone, log
const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
