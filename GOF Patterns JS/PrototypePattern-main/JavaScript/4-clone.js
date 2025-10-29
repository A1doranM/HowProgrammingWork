'use strict';

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  move(x, y) {
    this.x += x;
    this.y += y;
  }
}

// Usage

console.group('Use structuredClone + Object.setPrototypeOf');
const p1 = new Point(10, 20);
console.log(p1);
const c1 = structuredClone(p1);
Object.setPrototypeOf(c1, Point.prototype);
c1.move(-5, 10);
console.log(c1);
console.groupEnd();

console.group('Use structuredClone for deep cloning');
const line = [new Point(0, 0), new Point(10, 10)];
console.log(line);
const clone = structuredClone(line);
console.log(clone);
console.groupEnd();

console.group('We can`t clone methods');
try {
  const p2 = {
    x: 10,
    y: 20,
    move(x, y) {
      this.x += x;
      this.y += y;
    },
  };
  console.log(p2);
  const c2 = structuredClone(p2);
  console.log(c2);
} catch (e) {
  console.log(e.message);
}
console.groupEnd();
