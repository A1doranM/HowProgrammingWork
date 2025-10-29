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

const p1 = new Point(10, 20);
console.log(p1);
const c1 = JSON.parse(JSON.stringify(p1));
Object.setPrototypeOf(c1, Point.prototype);
c1.move(-5, 10);
console.log(c1);
