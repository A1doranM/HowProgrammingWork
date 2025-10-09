'use strict';

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static move(point, x, y) {
    point.x += x;
    point.y += y;
  }

  static clone({ x, y }) {
    return new Point(x, y);
  }

  static toString({ x, y }) {
    return `(${x}, ${y})`;
  }
}

// Usage

const p1 = new Point(10, 20);
console.log(Point.toString(p1));
const c1 = Point.clone(p1);
Point.move(c1, -5, 10);
console.log(Point.toString(c1));
