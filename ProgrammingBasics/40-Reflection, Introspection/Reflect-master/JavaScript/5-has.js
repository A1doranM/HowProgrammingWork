"use strict";

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const obj1 = new Point(10, 20);
// has идентичен конструкции x in object.
console.log({
  has: {
    x: Reflect.has(obj1, "x"),
    y: Reflect.has(obj1, "y"),
    z: Reflect.has(obj1, "z"),
  }
});

console.log({
  in: {
    x: "x" in obj1,
    y: "y" in obj1,
    z: "z" in obj1,
  }
});
