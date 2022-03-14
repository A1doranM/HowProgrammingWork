"use strict";

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const obj1 = new Point(10, 20);

Reflect.deleteProperty(obj1, "x");
delete obj1.y;

console.dir({ obj1 });
