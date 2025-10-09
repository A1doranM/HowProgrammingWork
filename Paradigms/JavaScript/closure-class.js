'use strict';

class Point {
  constructor(ax, ay) {
    this.x = ax;
    this.y = ay;
    const clone = () => new Point(this.x, this.y);
    const toString = () => `(${this.x}, ${this.y})`;
    return { clone, toString };
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}

// Usage

const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
