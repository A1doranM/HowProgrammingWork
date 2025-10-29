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
const c1 = Object.assign({}, p1);
Object.setPrototypeOf(c1, Point.prototype);
c1.move(-5, 10);
console.log(c1);

console.log('');

const line = [new Point(0, 0), new Point(10, 10)];
console.log(line);
const clone = Object.assign({}, line);
console.log(clone);
