"use strict";

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const obj1 = new Point(10, 20);

const x = Reflect.get(obj1, "x");
Reflect.set(obj1, "y", 30);

// const x = obj1["x"];
// obj1["y"] = 30;

// const x = obj1.x;
// obj1.y = 30;

console.dir({ x, obj1 });
